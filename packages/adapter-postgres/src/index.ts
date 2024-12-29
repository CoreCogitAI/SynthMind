import { v4 } from "uuid";

// Import the entire module as default
import pg from "pg";
/**
 * Alias for pg.Pool type.
 */
type Pool = pg.Pool;

import {
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow,
} from "pg";
import {
    Account,
    Actor,
    GoalStatus,
    type Goal,
    type Memory,
    type Relationship,
    type UUID,
    type IDatabaseCacheAdapter,
    Participant,
    elizaLogger,
    getEmbeddingConfig,
    DatabaseAdapter,
    EmbeddingProvider,
} from "@elizaos/core";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/**
 * PostgreSQL database adapter that extends the DatabaseAdapter class and implements the IDatabaseCacheAdapter interface.
 * Manages database connections, error handling, retry logic, and various database operations.
 *
 * @class
 * @extends DatabaseAdapter<Pool>
 * @implements IDatabaseCacheAdapter
export class PostgresDatabaseAdapter
    extends DatabaseAdapter<Pool>
    implements IDatabaseCacheAdapter
{
    private pool: Pool;
    private readonly maxRetries: number = 3;
    private readonly baseDelay: number = 1000; // 1 second
    private readonly maxDelay: number = 10000; // 10 seconds
    private readonly jitterMax: number = 1000; // 1 second
    private readonly connectionTimeout: number = 5000; // 5 seconds

/**
 * Constructor for creating a new connection pool with specified configuration options.
 * @param {any} connectionConfig - Additional configuration options to override defaults.
 */
    constructor(connectionConfig: any) {
        super({
            //circuitbreaker stuff
            failureThreshold: 5,
            resetTimeout: 60000,
            halfOpenMaxAttempts: 3,
        });

        const defaultConfig = {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: this.connectionTimeout,
        };

        this.pool = new pg.Pool({
            ...defaultConfig,
            ...connectionConfig, // Allow overriding defaults
        });

        this.pool.on("error", (err) => {
            elizaLogger.error("Unexpected pool error", err);
            this.handlePoolError(err);
        });

        this.setupPoolErrorHandling();
        this.testConnection();
    }

/**
 * Sets up error handling for the pool.
 * Handles SIGINT, SIGTERM, and beforeExit signals by calling cleanup() function.
 */
    private setupPoolErrorHandling() {
        process.on("SIGINT", async () => {
            await this.cleanup();
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            await this.cleanup();
            process.exit(0);
        });

        process.on("beforeExit", async () => {
            await this.cleanup();
        });
    }

/**
 * Executes the given operation with a circuit breaker and retry pattern.
 * 
 * @template T 
 * @param {() => Promise<T>} operation The operation to be executed.
 * @param {string} context The context in which the operation is executed.
 * @returns {Promise<T>} The result of the operation.
 */
    private async withDatabase<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<T> {
        return this.withCircuitBreaker(async () => {
            return this.withRetry(operation);
        }, context);
    }

/**
 * Execute the given asynchronous operation with retry logic.
 * @template T
 * @param {() => Promise<T>} operation The operation to be executed.
 * @returns {Promise<T>} A promise that resolves with the result of the operation.
 */
    private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error = new Error("Unknown error"); // Initialize with default

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                if (attempt < this.maxRetries) {
                    // Calculate delay with exponential backoff
                    const backoffDelay = Math.min(
                        this.baseDelay * Math.pow(2, attempt - 1),
                        this.maxDelay
                    );

                    // Add jitter to prevent thundering herd
                    const jitter = Math.random() * this.jitterMax;
                    const delay = backoffDelay + jitter;

                    elizaLogger.warn(
                        `Database operation failed (attempt ${attempt}/${this.maxRetries}):`,
                        {
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                            nextRetryIn: `${(delay / 1000).toFixed(1)}s`,
                        }
                    );

                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    elizaLogger.error("Max retry attempts reached:", {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        totalAttempts: attempt,
                    });
                    throw error instanceof Error
                        ? error
                        : new Error(String(error));
                }
            }
        }

        throw lastError;
    }

/**
 * Handles the occurrence of a pool error by attempting to reconnect the pool.
 * 
 * @param {Error} error - The error that occurred in the pool.
 * @returns {Promise<void>} - A Promise that resolves once the pool has been successfully reconnected.
 */
    private async handlePoolError(error: Error) {
        elizaLogger.error("Pool error occurred, attempting to reconnect", {
            error: error.message,
        });

        try {
            // Close existing pool
            await this.pool.end();

            // Create new pool
            this.pool = new pg.Pool({
                ...this.pool.options,
                connectionTimeoutMillis: this.connectionTimeout,
            });

            await this.testConnection();
            elizaLogger.success("Pool reconnection successful");
        } catch (reconnectError) {
            elizaLogger.error("Failed to reconnect pool", {
                error:
                    reconnectError instanceof Error
                        ? reconnectError.message
                        : String(reconnectError),
            });
            throw reconnectError;
        }
    }

/**
 * Asynchronously run a database query.
 * 
 * @template R - The type of the result rows
 * @template I - The type of the query values
 * @param {string | QueryConfig<I>} queryTextOrConfig - The SQL query text or configuration object
 * @param {QueryConfigValues<I>} [values] - The values to substitute into the query
 * @returns {Promise<QueryResult<R>>} A Promise that resolves with the query result
 */
    async query<R extends QueryResultRow = any, I = any[]>(
        queryTextOrConfig: string | QueryConfig<I>,
        values?: QueryConfigValues<I>
    ): Promise<QueryResult<R>> {
        return this.withDatabase(async () => {
            return await this.pool.query(queryTextOrConfig, values);
        }, "query");
    }

/**
 * Initializes the application by ensuring database connection, setting up application settings for embedding dimension,
 * checking if schema already exists, and committing or rolling back the transaction accordingly.
 * @returns {Promise<void>} Promise that resolves once initialization is complete or rejects with an error.
 */
    async init() {
        await this.testConnection();

        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");

            // Set application settings for embedding dimension
            const embeddingConfig = getEmbeddingConfig();
            if (embeddingConfig.provider === EmbeddingProvider.OpenAI) {
                await client.query("SET app.use_openai_embedding = 'true'");
                await client.query("SET app.use_ollama_embedding = 'false'");
            } else if (embeddingConfig.provider === EmbeddingProvider.Ollama) {
                await client.query("SET app.use_openai_embedding = 'false'");
                await client.query("SET app.use_ollama_embedding = 'true'");
            } else {
                await client.query("SET app.use_openai_embedding = 'false'");
                await client.query("SET app.use_ollama_embedding = 'false'");
            }

            // Check if schema already exists (check for a core table)
            const { rows } = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'rooms'
                );
            `);

            if (!rows[0].exists) {
                const schema = fs.readFileSync(
                    path.resolve(__dirname, "../schema.sql"),
                    "utf8"
                );
                await client.query(schema);
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

/**
 * Closes the pool of connections.
 * @async
 */
    async close() {
        await this.pool.end();
    }

/**
 * Asynchronously tests the database connection by attempting to connect to the database
 * and running a test query to check if the connection is successful.
 * 
 * @returns {Promise<boolean>} A boolean indicating whether the database connection test was successful or not.
 */
    async testConnection(): Promise<boolean> {
        let client;
        try {
            client = await this.pool.connect();
            const result = await client.query("SELECT NOW()");
            elizaLogger.success(
                "Database connection test successful:",
                result.rows[0]
            );
            return true;
        } catch (error) {
            elizaLogger.error("Database connection test failed:", error);
            throw new Error(
                `Failed to connect to database: ${(error as Error).message}`
            );
        } finally {
            if (client) client.release();
        }
    }

/**
 * Asynchronously cleans up and closes the database pool.
 * 
 * @returns {Promise<void>} A Promise that resolves once the database pool is successfully closed.
 */
    async cleanup(): Promise<void> {
        try {
            await this.pool.end();
            elizaLogger.info("Database pool closed");
        } catch (error) {
            elizaLogger.error("Error closing database pool:", error);
        }
    }

/**
 * Asynchronously retrieves the room ID from the database.
 * 
 * @param {UUID} roomId - The ID of the room to retrieve.
 * @returns {Promise<UUID | null>} The room ID if found, otherwise null.
 */
    async getRoom(roomId: UUID): Promise<UUID | null> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                "SELECT id FROM rooms WHERE id = $1",
                [roomId]
            );
            return rows.length > 0 ? (rows[0].id as UUID) : null;
        }, "getRoom");
    }

/**
 * Retrieve participants for a specific account based on the user ID.
 * @param {UUID} userId - The ID of the user account to retrieve participants for.
 * @returns {Promise<Participant[]>} A promise that resolves to an array of Participant objects.
 */
    async getParticipantsForAccount(userId: UUID): Promise<Participant[]> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                `SELECT id, "userId", "roomId", "last_message_read"
                FROM participants
                WHERE "userId" = $1`,
                [userId]
            );
            return rows as Participant[];
        }, "getParticipantsForAccount");
    }

/**
 * Retrieves the user state for a participant in a specific room.
 * 
 * @param {UUID} roomId - The ID of the room to look up the participant in.
 * @param {UUID} userId - The ID of the user to retrieve the state for.
 * @returns {Promise<"FOLLOWED" | "MUTED" | null>} The user state of the participant in the room, 
 * either "FOLLOWED", "MUTED", or null if no user state is found.
 */
    async getParticipantUserState(
        roomId: UUID,
        userId: UUID
    ): Promise<"FOLLOWED" | "MUTED" | null> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                `SELECT "userState" FROM participants WHERE "roomId" = $1 AND "userId" = $2`,
                [roomId, userId]
            );
            return rows.length > 0 ? rows[0].userState : null;
        }, "getParticipantUserState");
    }

/**
 * Retrieves memories for a given list of room IDs, optionally filtered by agent ID.
 * 
 * @param {Object} params - The parameters for the query.
 * @param {UUID[]} params.roomIds - The list of room IDs.
 * @param {UUID} [params.agentId] - The agent ID to filter by.
 * @param {string} params.tableName - The table name to query.
 * @returns {Promise<Memory[]>} - The memories matching the criteria.
 */
    async getMemoriesByRoomIds(params: {
        roomIds: UUID[];
        agentId?: UUID;
        tableName: string;
    }): Promise<Memory[]> {
        return this.withDatabase(async () => {
            if (params.roomIds.length === 0) return [];
            const placeholders = params.roomIds
                .map((_, i) => `$${i + 2}`)
                .join(", ");

            let query = `SELECT * FROM memories WHERE type = $1 AND "roomId" IN (${placeholders})`;
            let queryParams = [params.tableName, ...params.roomIds];

            if (params.agentId) {
                query += ` AND "agentId" = $${params.roomIds.length + 2}`;
                queryParams = [...queryParams, params.agentId];
            }

            const { rows } = await this.pool.query(query, queryParams);
            return rows.map((row) => ({
                ...row,
                content:
                    typeof row.content === "string"
                        ? JSON.parse(row.content)
                        : row.content,
            }));
        }, "getMemoriesByRoomIds");
    }

/**
 * Set the user state for a participant in a room.
 * @param {UUID} roomId - The ID of the room.
 * @param {UUID} userId - The ID of the user.
 * @param {"FOLLOWED" | "MUTED" | null} state - The state to set for the user ("FOLLOWED", "MUTED", or null).
 * @returns {Promise<void>} A Promise that resolves when the user state has been set.
 */
    async setParticipantUserState(
        roomId: UUID,
        userId: UUID,
        state: "FOLLOWED" | "MUTED" | null
    ): Promise<void> {
        return this.withDatabase(async () => {
            await this.pool.query(
                `UPDATE participants SET "userState" = $1 WHERE "roomId" = $2 AND "userId" = $3`,
                [state, roomId, userId]
            );
        }, "setParticipantUserState");
    }

/**
 * Retrieves the list of participants for a specific room.
 * @param {UUID} roomId - The ID of the room
 * @returns {Promise<UUID[]>} - A promise that resolves with an array of participant UUIDs
 */
    async getParticipantsForRoom(roomId: UUID): Promise<UUID[]> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                'SELECT "userId" FROM participants WHERE "roomId" = $1',
                [roomId]
            );
            return rows.map((row) => row.userId);
        }, "getParticipantsForRoom");
    }

/**
 * Asynchronously retrieves an account based on the provided user ID.
 * 
 * @param {UUID} userId - The unique identifier of the user account.
 * @returns {Promise<Account | null>} - A promise that resolves to the retrieved account
 * or null if the account is not found.
 */
    async getAccountById(userId: UUID): Promise<Account | null> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                "SELECT * FROM accounts WHERE id = $1",
                [userId]
            );
            if (rows.length === 0) {
                elizaLogger.debug("Account not found:", { userId });
                return null;
            }

            const account = rows[0];
            // elizaLogger.debug("Account retrieved:", {
            //     userId,
            //     hasDetails: !!account.details,
            // });

            return {
                ...account,
                details:
                    typeof account.details === "string"
                        ? JSON.parse(account.details)
                        : account.details,
            };
        }, "getAccountById");
    }

/**
 * Creates a new account in the database.
 * 
 * @param {Account} account - The account object containing details of the account.
 * @returns {Promise<boolean>} - A promise that resolves to true if the account was created successfully, and false if there was an error.
 */
    async createAccount(account: Account): Promise<boolean> {
        return this.withDatabase(async () => {
            try {
                const accountId = account.id ?? v4();
                await this.pool.query(
                    `INSERT INTO accounts (id, name, username, email, "avatarUrl", details)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        accountId,
                        account.name,
                        account.username || "",
                        account.email || "",
                        account.avatarUrl || "",
                        JSON.stringify(account.details),
                    ]
                );
                elizaLogger.debug("Account created successfully:", {
                    accountId,
                });
                return true;
            } catch (error) {
                elizaLogger.error("Error creating account:", {
                    error:
                        error instanceof Error ? error.message : String(error),
                    accountId: account.id,
                    name: account.name, // Only log non-sensitive fields
                });
                return false; // Return false instead of throwing to maintain existing behavior
            }
        }, "createAccount");
    }

/**
 * Retrieves actors for a given room ID from the database.
 * 
 * @param {Object} params - The parameters for the query.
 * @param {UUID} params.roomId - The room ID to retrieve actors for.
 * @returns {Promise<Actor[]>} - A promise that resolves to an array of Actor objects.
 */
    async getActorById(params: { roomId: UUID }): Promise<Actor[]> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                `SELECT a.id, a.name, a.username, a.details
                FROM participants p
                LEFT JOIN accounts a ON p."userId" = a.id
                WHERE p."roomId" = $1`,
                [params.roomId]
            );

            elizaLogger.debug("Retrieved actors:", {
                roomId: params.roomId,
                actorCount: rows.length,
            });

            return rows.map((row) => {
                try {
                    return {
                        ...row,
                        details:
                            typeof row.details === "string"
                                ? JSON.parse(row.details)
                                : row.details,
                    };
                } catch (error) {
                    elizaLogger.warn("Failed to parse actor details:", {
                        actorId: row.id,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                    return {
                        ...row,
                        details: {}, // Provide default empty details on parse error
                    };
                }
            });
        }, "getActorById").catch((error) => {
            elizaLogger.error("Failed to get actors:", {
                roomId: params.roomId,
                error: error.message,
            });
            throw error; // Re-throw to let caller handle database errors
        });
    }

/**
 * Retrieves a memory from the database based on the provided ID.
 * @param {UUID} id - The ID of the memory to retrieve.
 * @returns {Promise<Memory | null>} The retrieved memory object or null if not found.
 */
    async getMemoryById(id: UUID): Promise<Memory | null> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                "SELECT * FROM memories WHERE id = $1",
                [id]
            );
            if (rows.length === 0) return null;

            return {
                ...rows[0],
                content:
                    typeof rows[0].content === "string"
                        ? JSON.parse(rows[0].content)
                        : rows[0].content,
            };
        }, "getMemoryById");
    }

/**
 * Asynchronously creates a memory in the database.
 * 
 * @param {Memory} memory - The memory object to create.
 * @param {string} tableName - The name of the table in which to create the memory.
 * @returns {Promise<void>} A Promise that resolves when memory creation is complete.
 */
    async createMemory(memory: Memory, tableName: string): Promise<void> {
        return this.withDatabase(async () => {
            elizaLogger.debug("PostgresAdapter createMemory:", {
                memoryId: memory.id,
                embeddingLength: memory.embedding?.length,
                contentLength: memory.content?.text?.length,
            });

            let isUnique = true;
            if (memory.embedding) {
                const similarMemories = await this.searchMemoriesByEmbedding(
                    memory.embedding,
                    {
                        tableName,
                        roomId: memory.roomId,
                        match_threshold: 0.95,
                        count: 1,
                    }
                );
                isUnique = similarMemories.length === 0;
            }

            await this.pool.query(
                `INSERT INTO memories (
                    id, type, content, embedding, "userId", "roomId", "agentId", "unique", "createdAt"
                ) VALUES ($1, $2, $3, $4, $5::uuid, $6::uuid, $7::uuid, $8, to_timestamp($9/1000.0))`,
                [
                    memory.id ?? v4(),
                    tableName,
                    JSON.stringify(memory.content),
                    memory.embedding ? `[${memory.embedding.join(",")}]` : null,
                    memory.userId,
                    memory.roomId,
                    memory.agentId,
                    memory.unique ?? isUnique,
                    Date.now(),
                ]
            );
        }, "createMemory");
    }

/**
 * Searches for memories using the provided parameters.
 * @param {Object} params - The parameters for the memory search.
 * @param {string} params.tableName - The name of the table to search.
 * @param {UUID} params.agentId - The ID of the agent.
 * @param {UUID} params.roomId - The ID of the room.
 * @param {number[]} params.embedding - The embedding to search for.
 * @param {number} params.match_threshold - The similarity threshold for a match.
 * @param {number} params.match_count - The number of matches to return.
 * @param {boolean} params.unique - Flag indicating if only unique memories should be returned.
 * @returns {Promise<Memory[]>} A Promise that resolves to an array of Memory objects.
 */
    async searchMemories(params: {
        tableName: string;
        agentId: UUID;
        roomId: UUID;
        embedding: number[];
        match_threshold: number;
        match_count: number;
        unique: boolean;
    }): Promise<Memory[]> {
        return await this.searchMemoriesByEmbedding(params.embedding, {
            match_threshold: params.match_threshold,
            count: params.match_count,
            agentId: params.agentId,
            roomId: params.roomId,
            unique: params.unique,
            tableName: params.tableName,
        });
    }

/**
 * Retrieves memories from the database based on the provided parameters.
 * 
 * @param {object} params - The parameters for filtering memories.
 * @param {UUID} params.roomId - The room ID for filtering memories.
 * @param {number} [params.count] - The maximum number of memories to retrieve.
 * @param {boolean} [params.unique] - Indicates if only unique memories should be retrieved.
 * @param {string} params.tableName - The name of the table to retrieve memories from.
 * @param {UUID} [params.agentId] - The ID of the agent to filter memories by.
 * @param {number} [params.start] - The starting timestamp for filtering memories by creation time.
 * @param {number} [params.end] - The ending timestamp for filtering memories by creation time.
 * @returns {Promise<Memory[]>} An array of memories that match the specified criteria.
 */
   

    async getMemories(params: {
        roomId: UUID;
        count?: number;
        unique?: boolean;
        tableName: string;
        agentId?: UUID;
        start?: number;
        end?: number;
    }): Promise<Memory[]> {
        // Parameter validation
        if (!params.tableName) throw new Error("tableName is required");
        if (!params.roomId) throw new Error("roomId is required");

        return this.withDatabase(async () => {
            // Build query
            let sql = `SELECT * FROM memories WHERE type = $1 AND "roomId" = $2`;
            const values: any[] = [params.tableName, params.roomId];
            let paramCount = 2;

            // Add time range filters
            if (params.start) {
                paramCount++;
                sql += ` AND "createdAt" >= to_timestamp($${paramCount})`;
                values.push(params.start / 1000);
            }

            if (params.end) {
                paramCount++;
                sql += ` AND "createdAt" <= to_timestamp($${paramCount})`;
                values.push(params.end / 1000);
            }

            // Add other filters
            if (params.unique) {
                sql += ` AND "unique" = true`;
            }

            if (params.agentId) {
                paramCount++;
                sql += ` AND "agentId" = $${paramCount}`;
                values.push(params.agentId);
            }

            // Add ordering and limit
            sql += ' ORDER BY "createdAt" DESC';

            if (params.count) {
                paramCount++;
                sql += ` LIMIT $${paramCount}`;
                values.push(params.count);
            }

            elizaLogger.debug("Fetching memories:", {
                roomId: params.roomId,
                tableName: params.tableName,
                unique: params.unique,
                agentId: params.agentId,
                timeRange:
                    params.start || params.end
                        ? {
                              start: params.start
                                  ? new Date(params.start).toISOString()
                                  : undefined,
                              end: params.end
                                  ? new Date(params.end).toISOString()
                                  : undefined,
                          }
                        : undefined,
                limit: params.count,
            });

            const { rows } = await this.pool.query(sql, values);
            return rows.map((row) => ({
                ...row,
                content:
                    typeof row.content === "string"
                        ? JSON.parse(row.content)
                        : row.content,
            }));
        }, "getMemories");
    }

/**
 * Retrieve goals from the database based on the provided parameters.
 * @param {Object} params - The parameters for filtering the goals query.
 * @param {UUID} params.roomId - The UUID of the room to get goals for.
 * @param {UUID} [params.userId] - The UUID of the user to filter goals by.
 * @param {boolean} [params.onlyInProgress] - Flag to only retrieve goals in progress.
 * @param {number} [params.count] - The maximum number of goals to retrieve.
 * @returns {Promise<Goal[]>} The goals that match the provided parameters.
 */
    async getGoals(params: {
        roomId: UUID;
        userId?: UUID | null;
        onlyInProgress?: boolean;
        count?: number;
    }): Promise<Goal[]> {
        return this.withDatabase(async () => {
            let sql = `SELECT * FROM goals WHERE "roomId" = $1`;
            const values: any[] = [params.roomId];
            let paramCount = 1;

            if (params.userId) {
                paramCount++;
                sql += ` AND "userId" = $${paramCount}`;
                values.push(params.userId);
            }

            if (params.onlyInProgress) {
                sql += " AND status = 'IN_PROGRESS'";
            }

            if (params.count) {
                paramCount++;
                sql += ` LIMIT $${paramCount}`;
                values.push(params.count);
            }

            const { rows } = await this.pool.query(sql, values);
            return rows.map((row) => ({
                ...row,
                objectives:
                    typeof row.objectives === "string"
                        ? JSON.parse(row.objectives)
                        : row.objectives,
            }));
        }, "getGoals");
    }

/**
 * Asynchronously updates a goal in the database.
 * 
 * @param {Goal} goal - The goal to be updated.
 * @return {Promise<void>} A Promise that resolves once the goal has been updated.
 */
    async updateGoal(goal: Goal): Promise<void> {
        return this.withDatabase(async () => {
            try {
                await this.pool.query(
                    `UPDATE goals SET name = $1, status = $2, objectives = $3 WHERE id = $4`,
                    [
                        goal.name,
                        goal.status,
                        JSON.stringify(goal.objectives),
                        goal.id,
                    ]
                );
            } catch (error) {
                elizaLogger.error("Failed to update goal:", {
                    goalId: goal.id,
                    error:
                        error instanceof Error ? error.message : String(error),
                    status: goal.status,
                });
                throw error;
            }
        }, "updateGoal");
    }

/**
 * Asynchronously creates a new goal entry in the database.
 * 
 * @param {Goal} goal - The goal object to be created.
 * @returns {Promise<void>} A promise that resolves when the goal is successfully created.
 */
    async createGoal(goal: Goal): Promise<void> {
        return this.withDatabase(async () => {
            await this.pool.query(
                `INSERT INTO goals (id, "roomId", "userId", name, status, objectives)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    goal.id ?? v4(),
                    goal.roomId,
                    goal.userId,
                    goal.name,
                    goal.status,
                    JSON.stringify(goal.objectives),
                ]
            );
        }, "createGoal");
    }

/**
 * Removes a goal from the database.
 * 
 * @param {UUID} goalId - The ID of the goal to remove.
 * @returns {Promise<void>} A promise that resolves when the goal is successfully removed.
 * @throws {Error} If goalId is not provided or if there is an error removing the goal.
 */
    async removeGoal(goalId: UUID): Promise<void> {
        if (!goalId) throw new Error("Goal ID is required");

        return this.withDatabase(async () => {
            try {
                const result = await this.pool.query(
                    "DELETE FROM goals WHERE id = $1 RETURNING id",
                    [goalId]
                );

                elizaLogger.debug("Goal removal attempt:", {
                    goalId,
                    removed: result?.rowCount ?? 0 > 0,
                });
            } catch (error) {
                elizaLogger.error("Failed to remove goal:", {
                    goalId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                throw error;
            }
        }, "removeGoal");
    }

/**
 * Asynchronously creates a new room in the database. If a roomId is provided, it will be used; otherwise, a random UUID will be generated.
 * 
 * @param {UUID} [roomId] - Optional room ID to use for the new room.
 * @returns {Promise<UUID>} - Promise that resolves with the ID of the newly created room.
 */
    async createRoom(roomId?: UUID): Promise<UUID> {
        return this.withDatabase(async () => {
            const newRoomId = roomId || v4();
            await this.pool.query("INSERT INTO rooms (id) VALUES ($1)", [
                newRoomId,
            ]);
            return newRoomId as UUID;
        }, "createRoom");
    }

/**
 * Removes a room from the database along with its related data.
 * 
 * @param {UUID} roomId - The ID of the room to be removed.
 * @returns {Promise<void>} - A promise that resolves when the room and related data are successfully removed.
 * @throws {Error} - If room ID is not provided or if the room to be removed is not found.
 */
    async removeRoom(roomId: UUID): Promise<void> {
        if (!roomId) throw new Error("Room ID is required");

        return this.withDatabase(async () => {
            const client = await this.pool.connect();
            try {
                await client.query("BEGIN");

                // First check if room exists
                const checkResult = await client.query(
                    "SELECT id FROM rooms WHERE id = $1",
                    [roomId]
                );

                if (checkResult.rowCount === 0) {
                    elizaLogger.warn("No room found to remove:", { roomId });
                    throw new Error(`Room not found: ${roomId}`);
                }

                // Remove related data first (if not using CASCADE)
                await client.query('DELETE FROM memories WHERE "roomId" = $1', [
                    roomId,
                ]);
                await client.query(
                    'DELETE FROM participants WHERE "roomId" = $1',
                    [roomId]
                );
                await client.query('DELETE FROM goals WHERE "roomId" = $1', [
                    roomId,
                ]);

                // Finally remove the room
                const result = await client.query(
                    "DELETE FROM rooms WHERE id = $1 RETURNING id",
                    [roomId]
                );

                await client.query("COMMIT");

                elizaLogger.debug(
                    "Room and related data removed successfully:",
                    {
                        roomId,
                        removed: result?.rowCount ?? 0 > 0,
                    }
                );
            } catch (error) {
                await client.query("ROLLBACK");
                elizaLogger.error("Failed to remove room:", {
                    roomId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                throw error;
            } finally {
                if (client) client.release();
            }
        }, "removeRoom");
    }

/**
 * Asynchronously creates a relationship between two users in the database.
 * 
 * @param {Object} params - The parameters for creating the relationship.
 * @param {UUID} params.userA - The ID of the first user.
 * @param {UUID} params.userB - The ID of the second user.
 * @returns {Promise<boolean>} A Promise that resolves to true if the relationship is successfully created, and false otherwise.
 */
    async createRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<boolean> {
        // Input validation
        if (!params.userA || !params.userB) {
            throw new Error("userA and userB are required");
        }

        return this.withDatabase(async () => {
            try {
                const relationshipId = v4();
                await this.pool.query(
                    `INSERT INTO relationships (id, "userA", "userB", "userId")
                    VALUES ($1, $2, $3, $4)
                    RETURNING id`,
                    [relationshipId, params.userA, params.userB, params.userA]
                );

                elizaLogger.debug("Relationship created successfully:", {
                    relationshipId,
                    userA: params.userA,
                    userB: params.userB,
                });

                return true;
            } catch (error) {
                // Check for unique constraint violation or other specific errors
                if ((error as { code?: string }).code === "23505") {
                    // Unique violation
                    elizaLogger.warn("Relationship already exists:", {
                        userA: params.userA,
                        userB: params.userB,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                } else {
                    elizaLogger.error("Failed to create relationship:", {
                        userA: params.userA,
                        userB: params.userB,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                }
                return false;
            }
        }, "createRelationship");
    }

/**
 * Asynchronously fetches a relationship between two users from the database.
 * 
 * @param {Object} params - The parameters for fetching the relationship.
 * @param {UUID} params.userA - The UUID of user A.
 * @param {UUID} params.userB - The UUID of user B.
 * @returns {Promise<Relationship | null>} A Promise that resolves to the relationship object if found, otherwise null.
 * @throws {Error} If userA or userB is missing.
 */
    async getRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<Relationship | null> {
        if (!params.userA || !params.userB) {
            throw new Error("userA and userB are required");
        }

        return this.withDatabase(async () => {
            try {
                const { rows } = await this.pool.query(
                    `SELECT * FROM relationships
                    WHERE ("userA" = $1 AND "userB" = $2)
                    OR ("userA" = $2 AND "userB" = $1)`,
                    [params.userA, params.userB]
                );

                if (rows.length > 0) {
                    elizaLogger.debug("Relationship found:", {
                        relationshipId: rows[0].id,
                        userA: params.userA,
                        userB: params.userB,
                    });
                    return rows[0];
                }

                elizaLogger.debug("No relationship found between users:", {
                    userA: params.userA,
                    userB: params.userB,
                });
                return null;
            } catch (error) {
                elizaLogger.error("Error fetching relationship:", {
                    userA: params.userA,
                    userB: params.userB,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                throw error;
            }
        }, "getRelationship");
    }

/**
 * Retrieves relationships for a specific user.
 * 
 * @param {Object} params - The parameters for the query.
 * @param {string} params.userId - The UUID of the user.
 * @returns {Promise<Relationship[]>} - The user's relationships.
 * @throws {Error} - If userId is not provided or an error occurs during database query.
 */
    async getRelationships(params: { userId: UUID }): Promise<Relationship[]> {
        if (!params.userId) {
            throw new Error("userId is required");
        }

        return this.withDatabase(async () => {
            try {
                const { rows } = await this.pool.query(
                    `SELECT * FROM relationships
                    WHERE "userA" = $1 OR "userB" = $1
                    ORDER BY "createdAt" DESC`, // Add ordering if you have this field
                    [params.userId]
                );

                elizaLogger.debug("Retrieved relationships:", {
                    userId: params.userId,
                    count: rows.length,
                });

                return rows;
            } catch (error) {
                elizaLogger.error("Failed to fetch relationships:", {
                    userId: params.userId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                throw error;
            }
        }, "getRelationships");
    }

/**
 * Retrieves cached embeddings based on the provided query parameters.
 * 
 * @param {Object} opts - The options object for the query.
 * @param {string} opts.query_table_name - The name of the table to query.
 * @param {number} opts.query_threshold - The threshold value for the query.
 * @param {string} opts.query_input - The input string to query against.
 * @param {string} opts.query_field_name - The name of the field to query.
 * @param {string} opts.query_field_sub_name - The sub-name of the field to query.
 * @param {number} opts.query_match_count - The number of matches to retrieve.
 * @returns {Promise<{ embedding: number[]; levenshtein_score: number }[]>} - A promise that resolves to an array of objects containing the embedding and Levenshtein score.
 */
    async getCachedEmbeddings(opts: {
        query_table_name: string;
        query_threshold: number;
        query_input: string;
        query_field_name: string;
        query_field_sub_name: string;
        query_match_count: number;
    }): Promise<{ embedding: number[]; levenshtein_score: number }[]> {
        // Input validation
        if (!opts.query_table_name)
            throw new Error("query_table_name is required");
        if (!opts.query_input) throw new Error("query_input is required");
        if (!opts.query_field_name)
            throw new Error("query_field_name is required");
        if (!opts.query_field_sub_name)
            throw new Error("query_field_sub_name is required");
        if (opts.query_match_count <= 0)
            throw new Error("query_match_count must be positive");

        return this.withDatabase(async () => {
            try {
                elizaLogger.debug("Fetching cached embeddings:", {
                    tableName: opts.query_table_name,
                    fieldName: opts.query_field_name,
                    subFieldName: opts.query_field_sub_name,
                    matchCount: opts.query_match_count,
                    inputLength: opts.query_input.length,
                });

                const sql = `
                    WITH content_text AS (
                        SELECT
                            embedding,
                            COALESCE(
                                content->$2->>$3,
                                ''
                            ) as content_text
                        FROM memories
                        WHERE type = $4
                        AND content->$2->>$3 IS NOT NULL
                    )
                    SELECT
                        embedding,
                        levenshtein(
                            $1,
                            content_text
                        ) as levenshtein_score
                    FROM content_text
                    WHERE levenshtein(
                        $1,
                        content_text
                    ) <= $6  -- Add threshold check
                    ORDER BY levenshtein_score
                    LIMIT $5
                `;

                const { rows } = await this.pool.query(sql, [
                    opts.query_input,
                    opts.query_field_name,
                    opts.query_field_sub_name,
                    opts.query_table_name,
                    opts.query_match_count,
                    opts.query_threshold,
                ]);

                elizaLogger.debug("Retrieved cached embeddings:", {
                    count: rows.length,
                    tableName: opts.query_table_name,
                    matchCount: opts.query_match_count,
                });

                return rows
                    .map(
                        (
                            row
                        ): {
                            embedding: number[];
                            levenshtein_score: number;
                        } | null => {
                            if (!Array.isArray(row.embedding)) return null;
                            return {
                                embedding: row.embedding,
                                levenshtein_score: Number(
                                    row.levenshtein_score
                                ),
                            };
                        }
                    )
                    .filter(
                        (
                            row
                        ): row is {
                            embedding: number[];
                            levenshtein_score: number;
                        } => row !== null
                    );
            } catch (error) {
                elizaLogger.error("Error in getCachedEmbeddings:", {
                    error:
                        error instanceof Error ? error.message : String(error),
                    tableName: opts.query_table_name,
                    fieldName: opts.query_field_name,
                });
                throw error;
            }
        }, "getCachedEmbeddings");
    }

/**
 * Asynchronous function to log an entry in the database.
 * 
 * @param {Object} params - The parameters for logging the entry.
 * @param {Object.<string, unknown>} params.body - The body of the log entry.
 * @param {string} params.userId - The ID of the user performing the action.
 * @param {string} params.roomId - The ID of the room where the action took place.
 * @param {string} params.type - The type of action being logged.
 * @returns {Promise<void>} - A Promise that resolves when the logging is completed.
 * @throws {Error} - If userId, roomId, type are missing or body is not a valid object.
 */
    async log(params: {
        body: { [key: string]: unknown };
        userId: UUID;
        roomId: UUID;
        type: string;
    }): Promise<void> {
        // Input validation
        if (!params.userId) throw new Error("userId is required");
        if (!params.roomId) throw new Error("roomId is required");
        if (!params.type) throw new Error("type is required");
        if (!params.body || typeof params.body !== "object") {
            throw new Error("body must be a valid object");
        }

        return this.withDatabase(async () => {
            try {
                const logId = v4(); // Generate ID for tracking
                await this.pool.query(
                    `INSERT INTO logs (
                        id,
                        body,
                        "userId",
                        "roomId",
                        type,
                        "createdAt"
                    ) VALUES ($1, $2, $3, $4, $5, NOW())
                    RETURNING id`,
                    [
                        logId,
                        JSON.stringify(params.body), // Ensure body is stringified
                        params.userId,
                        params.roomId,
                        params.type,
                    ]
                );

                elizaLogger.debug("Log entry created:", {
                    logId,
                    type: params.type,
                    roomId: params.roomId,
                    userId: params.userId,
                    bodyKeys: Object.keys(params.body),
                });
            } catch (error) {
                elizaLogger.error("Failed to create log entry:", {
                    error:
                        error instanceof Error ? error.message : String(error),
                    type: params.type,
                    roomId: params.roomId,
                    userId: params.userId,
                });
                throw error;
            }
        }, "log");
    }

/**
 * Searches for memories based on the embedding vector and specified parameters.
 * 
 * @param {number[]} embedding - The embedding vector to search for
 * @param {Object} params - The parameters for the search
 * @param {number} [params.match_threshold] - The similarity threshold for the search
 * @param {number} [params.count] - The maximum number of memories to return
 * @param {UUID} [params.agentId] - The agent ID to filter by
 * @param {UUID} [params.roomId] - The room ID to filter by
 * @param {boolean} [params.unique] - Flag to indicate if only unique memories should be returned
 * @param {string} params.tableName - The name of the table to search in
 * @returns {Promise<Memory[]>} - An array of Memory objects that match the search criteria
 */
    async searchMemoriesByEmbedding(
        embedding: number[],
        params: {
            match_threshold?: number;
            count?: number;
            agentId?: UUID;
            roomId?: UUID;
            unique?: boolean;
            tableName: string;
        }
    ): Promise<Memory[]> {
        return this.withDatabase(async () => {
            elizaLogger.debug("Incoming vector:", {
                length: embedding.length,
                sample: embedding.slice(0, 5),
                isArray: Array.isArray(embedding),
                allNumbers: embedding.every((n) => typeof n === "number"),
            });

            // Validate embedding dimension
            if (embedding.length !== getEmbeddingConfig().dimensions) {
                throw new Error(
                    `Invalid embedding dimension: expected ${getEmbeddingConfig().dimensions}, got ${embedding.length}`
                );
            }

            // Ensure vector is properly formatted
            const cleanVector = embedding.map((n) => {
                if (!Number.isFinite(n)) return 0;
                // Limit precision to avoid floating point issues
                return Number(n.toFixed(6));
            });

            // Format for Postgres pgvector
            const vectorStr = `[${cleanVector.join(",")}]`;

            elizaLogger.debug("Vector debug:", {
                originalLength: embedding.length,
                cleanLength: cleanVector.length,
                sampleStr: vectorStr.slice(0, 100),
            });

            let sql = `
                SELECT *,
                1 - (embedding <-> $1::vector(${getEmbeddingConfig().dimensions})) as similarity
                FROM memories
                WHERE type = $2
            `;

            const values: any[] = [vectorStr, params.tableName];

            // Log the query for debugging
            elizaLogger.debug("Query debug:", {
                sql: sql.slice(0, 200),
                paramTypes: values.map((v) => typeof v),
                vectorStrLength: vectorStr.length,
            });

            let paramCount = 2;

            if (params.unique) {
                sql += ` AND "unique" = true`;
            }

            if (params.agentId) {
                paramCount++;
                sql += ` AND "agentId" = $${paramCount}`;
                values.push(params.agentId);
            }

            if (params.roomId) {
                paramCount++;
                sql += ` AND "roomId" = $${paramCount}::uuid`;
                values.push(params.roomId);
            }

            if (params.match_threshold) {
                paramCount++;
                sql += ` AND 1 - (embedding <-> $1::vector) >= $${paramCount}`;
                values.push(params.match_threshold);
            }

            sql += ` ORDER BY embedding <-> $1::vector`;

            if (params.count) {
                paramCount++;
                sql += ` LIMIT $${paramCount}`;
                values.push(params.count);
            }

            const { rows } = await this.pool.query(sql, values);
            return rows.map((row) => ({
                ...row,
                content:
                    typeof row.content === "string"
                        ? JSON.parse(row.content)
                        : row.content,
                similarity: row.similarity,
            }));
        }, "searchMemoriesByEmbedding");
    }

/**
 * Add a participant to a room in the database.
 * 
 * @param {UUID} userId - The UUID of the user to add as a participant.
 * @param {UUID} roomId - The UUID of the room where the user will be a participant.
 * @returns {Promise<boolean>} - A promise that resolves to true if the participant is added successfully, false otherwise.
 */
    async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        return this.withDatabase(async () => {
            try {
                await this.pool.query(
                    `INSERT INTO participants (id, "userId", "roomId")
                    VALUES ($1, $2, $3)`,
                    [v4(), userId, roomId]
                );
                return true;
            } catch (error) {
                console.log("Error adding participant", error);
                return false;
            }
        }, "addParticpant");
    }

/**
 * Removes a participant from a room by userId and roomId.
 * 
 * @param {UUID} userId - The UUID of the user to be removed from the room.
 * @param {UUID} roomId - The UUID of the room to remove the user from.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating the success of the operation.
 */
    async removeParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        return this.withDatabase(async () => {
            try {
                await this.pool.query(
                    `DELETE FROM participants WHERE "userId" = $1 AND "roomId" = $2`,
                    [userId, roomId]
                );
                return true;
            } catch (error) {
                console.log("Error removing participant", error);
                return false;
            }
        }, "removeParticipant");
    }

/**
 * Update the status of a goal in the database.
 * @param {Object} params - The parameters for updating the goal status.
 * @param {UUID} params.goalId - The ID of the goal to update.
 * @param {GoalStatus} params.status - The new status to set for the goal.
 * @returns {Promise<void>} - A Promise that resolves when the goal status is updated.
 */
    async updateGoalStatus(params: {
        goalId: UUID;
        status: GoalStatus;
    }): Promise<void> {
        return this.withDatabase(async () => {
            await this.pool.query(
                "UPDATE goals SET status = $1 WHERE id = $2",
                [params.status, params.goalId]
            );
        }, "updateGoalStatus");
    }

/**
 * Remove a memory from the database.
 * 
 * @param {UUID} memoryId - The ID of the memory to remove.
 * @param {string} tableName - The name of the table where the memory is stored.
 * @returns {Promise<void>} A promise that resolves when the memory is successfully removed.
 */
    async removeMemory(memoryId: UUID, tableName: string): Promise<void> {
        return this.withDatabase(async () => {
            await this.pool.query(
                "DELETE FROM memories WHERE type = $1 AND id = $2",
                [tableName, memoryId]
            );
        }, "removeMemory");
    }

/**
 * Remove all memories associated with a specific room ID from the database.
 * 
 * @param {UUID} roomId - The ID of the room where memories are stored.
 * @param {string} tableName - The name of the table where memories are stored.
 * @returns {Promise<void>} A promise that resolves once memories are removed.
 */
    async removeAllMemories(roomId: UUID, tableName: string): Promise<void> {
        return this.withDatabase(async () => {
            await this.pool.query(
                `DELETE FROM memories WHERE type = $1 AND "roomId" = $2`,
                [tableName, roomId]
            );
        }, "removeAllMemories");
    }

/**
 * Counts the number of memories in a specific room.
 * 
 * @param {UUID} roomId - The ID of the room to count memories in.
 * @param {boolean} [unique=true] - Flag to specify if unique memories should be counted only.
 * @param {string} [tableName=""] - The name of the table to query memories from.
 * @returns {Promise<number>} The number of memories found in the specified room.
 * @throws {Error} When tableName parameter is not provided.
 */
    async countMemories(
        roomId: UUID,
        unique = true,
        tableName = ""
    ): Promise<number> {
        if (!tableName) throw new Error("tableName is required");

        return this.withDatabase(async () => {
            let sql = `SELECT COUNT(*) as count FROM memories WHERE type = $1 AND "roomId" = $2`;
            if (unique) {
                sql += ` AND "unique" = true`;
            }

            const { rows } = await this.pool.query(sql, [tableName, roomId]);
            return parseInt(rows[0].count);
        }, "countMemories");
    }

/**
 * Remove all goals for a specific room.
 * @param {UUID} roomId - The unique identifier of the room to remove goals from.
 * @returns {Promise<void>} - A promise that resolves when all goals are successfully removed.
 */
    async removeAllGoals(roomId: UUID): Promise<void> {
        return this.withDatabase(async () => {
            await this.pool.query(`DELETE FROM goals WHERE "roomId" = $1`, [
                roomId,
            ]);
        }, "removeAllGoals");
    }

/**
 * Retrieves the rooms for a specific participant.
 * @param {UUID} userId - The unique identifier of the participant.
 * @returns {Promise<UUID[]>} Array of roomIds associated with the participant.
 */
    async getRoomsForParticipant(userId: UUID): Promise<UUID[]> {
        return this.withDatabase(async () => {
            const { rows } = await this.pool.query(
                `SELECT "roomId" FROM participants WHERE "userId" = $1`,
                [userId]
            );
            return rows.map((row) => row.roomId);
        }, "getRoomsForParticipant");
    }

/**
 * Retrieve a list of room IDs for specified participants.
 * 
 * @param {UUID[]} userIds - An array of UUIDs representing the user IDs of participants.
 * @returns {Promise<UUID[]>} A Promise that resolves with an array of UUIDs representing the room IDs that the participants are part of.
 */
    async getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]> {
        return this.withDatabase(async () => {
            const placeholders = userIds.map((_, i) => `$${i + 1}`).join(", ");
            const { rows } = await this.pool.query(
                `SELECT DISTINCT "roomId" FROM participants WHERE "userId" IN (${placeholders})`,
                userIds
            );
            return rows.map((row) => row.roomId);
        }, "getRoomsForParticipants");
    }

/**
 * Retrieves actor details for a given room ID.
 * @param {Object} params - The parameters for fetching actor details.
 * @param {string} params.roomId - The ID of the room to fetch actor details for.
 * @returns {Promise<Actor[]>} - A promise that resolves to an array of Actor objects with their details.
 */
    async getActorDetails(params: { roomId: string }): Promise<Actor[]> {
        if (!params.roomId) {
            throw new Error("roomId is required");
        }

        return this.withDatabase(async () => {
            try {
                const sql = `
                    SELECT
                        a.id,
                        a.name,
                        a.username,
                        a."avatarUrl",
                        COALESCE(a.details::jsonb, '{}'::jsonb) as details
                    FROM participants p
                    LEFT JOIN accounts a ON p."userId" = a.id
                    WHERE p."roomId" = $1
                    ORDER BY a.name
                `;

                const result = await this.pool.query<Actor>(sql, [
                    params.roomId,
                ]);

                elizaLogger.debug("Retrieved actor details:", {
                    roomId: params.roomId,
                    actorCount: result.rows.length,
                });

                return result.rows.map((row) => {
                    try {
                        return {
                            ...row,
                            details:
                                typeof row.details === "string"
                                    ? JSON.parse(row.details)
                                    : row.details,
                        };
                    } catch (parseError) {
                        elizaLogger.warn("Failed to parse actor details:", {
                            actorId: row.id,
                            error:
                                parseError instanceof Error
                                    ? parseError.message
                                    : String(parseError),
                        });
                        return {
                            ...row,
                            details: {}, // Fallback to empty object if parsing fails
                        };
                    }
                });
            } catch (error) {
                elizaLogger.error("Failed to fetch actor details:", {
                    roomId: params.roomId,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                throw new Error(
                    `Failed to fetch actor details: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }, "getActorDetails");
    }

/**
 * Retrieves the cached value for a given key and agentId.
 * @param {Object} params - The parameters for the cache query.
 * @param {string} params.key - The key to retrieve the value for.
 * @param {UUID} params.agentId - The agentId associated with the cache.
 * @returns {Promise<string | undefined>} The cached value if found, otherwise undefined.
 */
    async getCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<string | undefined> {
        return this.withDatabase(async () => {
            try {
                const sql = `SELECT "value"::TEXT FROM cache WHERE "key" = $1 AND "agentId" = $2`;
                const { rows } = await this.query<{ value: string }>(sql, [
                    params.key,
                    params.agentId,
                ]);
                return rows[0]?.value ?? undefined;
            } catch (error) {
                elizaLogger.error("Error fetching cache", {
                    error:
                        error instanceof Error ? error.message : String(error),
                    key: params.key,
                    agentId: params.agentId,
                });
                return undefined;
            }
        }, "getCache");
    }

/**
 * Asynchronously sets a value in the cache database for a specific key and agentId.
 * If the key and agentId combination already exists, the value will be updated with the new value provided.
 * 
 * @param {Object} params - The parameters for setting the cache.
 * @param {string} params.key - The key to identify the cache entry.
 * @param {UUID} params.agentId - The agent ID associated with the cache entry.
 * @param {string} params.value - The value to be stored in the cache.
 * 
 * @returns {Promise<boolean>} - A promise that resolves to true if the cache was successfully set or updated, and false otherwise.
 */
    async setCache(params: {
        key: string;
        agentId: UUID;
        value: string;
    }): Promise<boolean> {
        return this.withDatabase(async () => {
            try {
                const client = await this.pool.connect();
                try {
                    await client.query("BEGIN");
                    await client.query(
                        `INSERT INTO cache ("key", "agentId", "value", "createdAt")
                         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                         ON CONFLICT ("key", "agentId")
                         DO UPDATE SET "value" = EXCLUDED.value, "createdAt" = CURRENT_TIMESTAMP`,
                        [params.key, params.agentId, params.value]
                    );
                    await client.query("COMMIT");
                    return true;
                } catch (error) {
                    await client.query("ROLLBACK");
                    elizaLogger.error("Error setting cache", {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        key: params.key,
                        agentId: params.agentId,
                    });
                    return false;
                } finally {
                    if (client) client.release();
                }
            } catch (error) {
                elizaLogger.error(
                    "Database connection error in setCache",
                    error
                );
                return false;
            }
        }, "setCache");
    }

/**
 * Asynchronously deletes a cache entry with the specified key and agentId from the database.
 * 
 * @param {Object} params - The parameters for deleting the cache entry.
 * @param {string} params.key - The key of the cache entry to delete.
 * @param {UUID} params.agentId - The agentId associated with the cache entry to delete.
 * @returns {Promise<boolean>} A Promise that resolves to true if the cache entry was deleted successfully, false otherwise.
 */
    async deleteCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<boolean> {
        return this.withDatabase(async () => {
            try {
                const client = await this.pool.connect();
                try {
                    await client.query("BEGIN");
                    await client.query(
                        `DELETE FROM cache WHERE "key" = $1 AND "agentId" = $2`,
                        [params.key, params.agentId]
                    );
                    await client.query("COMMIT");
                    return true;
                } catch (error) {
                    await client.query("ROLLBACK");
                    elizaLogger.error("Error deleting cache", {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        key: params.key,
                        agentId: params.agentId,
                    });
                    return false;
                } finally {
                    client.release();
                }
            } catch (error) {
                elizaLogger.error(
                    "Database connection error in deleteCache",
                    error
                );
                return false;
            }
        }, "deleteCache");
    }
}

export default PostgresDatabaseAdapter;
