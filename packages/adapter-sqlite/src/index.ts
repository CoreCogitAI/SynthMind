export * from "./sqliteTables.ts";
export * from "./sqlite_vec.ts";

import { DatabaseAdapter, IDatabaseCacheAdapter } from "@elizaos/core";
import {
    Account,
    Actor,
    GoalStatus,
    Participant,
    type Goal,
    type Memory,
    type Relationship,
    type UUID,
} from "@elizaos/core";
import { Database } from "better-sqlite3";
import { v4 } from "uuid";
import { load } from "./sqlite_vec.ts";
import { sqliteTables } from "./sqliteTables.ts";

/**
 * Adapter class for interacting with a SQLite database, implementing database cache functionality.
 * @extends DatabaseAdapter<Database>
 * @implements IDatabaseCacheAdapter
 */
export class SqliteDatabaseAdapter
    extends DatabaseAdapter<Database>
    implements IDatabaseCacheAdapter
{
/**
 * Retrieve the UUID of a room from the database based on the given room ID.
 * @param {UUID} roomId - The unique identifier of the room to retrieve.
 * @returns {Promise<UUID | null>} The UUID of the room, or null if the room is not found.
 */
    async getRoom(roomId: UUID): Promise<UUID | null> {
        const sql = "SELECT id FROM rooms WHERE id = ?";
        const room = this.db.prepare(sql).get(roomId) as
            | { id: string }
            | undefined;
        return room ? (room.id as UUID) : null;
    }

/**
 * Get participants for a specific account user ID.
 *
 * @param {UUID} userId - The UUID of the account user.
 * @returns {Promise<Participant[]>} - A promise that resolves with an array of Participant objects that match the user ID.
 */
    async getParticipantsForAccount(userId: UUID): Promise<Participant[]> {
        const sql = `
      SELECT p.id, p.userId, p.roomId, p.last_message_read
      FROM participants p
      WHERE p.userId = ?
    `;
        const rows = this.db.prepare(sql).all(userId) as Participant[];
        return rows;
    }

/**
 * Retrieves the participants for a specific room identified by the roomId.
 * @param {UUID} roomId - The unique identifier of the room.
 * @return {Promise<UUID[]>} - A promise that resolves to an array of UUIDs representing the participants.
 */
    async getParticipantsForRoom(roomId: UUID): Promise<UUID[]> {
        const sql = "SELECT userId FROM participants WHERE roomId = ?";
        const rows = this.db.prepare(sql).all(roomId) as { userId: string }[];
        return rows.map((row) => row.userId as UUID);
    }

/**
 * Retrieves the user state of a participant in a room. Possible user states are "FOLLOWED", "MUTED" or null if no user state is found.
 * 
 * @param {UUID} roomId - The UUID of the room where the participant is located.
 * @param {UUID} userId - The UUID of the user to retrieve the state for.
 * @returns {Promise<"FOLLOWED" | "MUTED" | null>} - The user state of the participant in the room.
 */
    async getParticipantUserState(
        roomId: UUID,
        userId: UUID
    ): Promise<"FOLLOWED" | "MUTED" | null> {
        const stmt = this.db.prepare(
            "SELECT userState FROM participants WHERE roomId = ? AND userId = ?"
        );
        const res = stmt.get(roomId, userId) as
            | { userState: "FOLLOWED" | "MUTED" | null }
            | undefined;
        return res?.userState ?? null;
    }

/**
 * Updates the user state for a participant in a room.
 * @param {UUID} roomId - The ID of the room.
 * @param {UUID} userId - The ID of the user.
 * @param {"FOLLOWED" | "MUTED" | null} state - The state to set for the user (either "FOLLOWED", "MUTED", or null).
 * @returns {Promise<void>} - A Promise that resolves once the user state has been updated.
 */
    async setParticipantUserState(
        roomId: UUID,
        userId: UUID,
        state: "FOLLOWED" | "MUTED" | null
    ): Promise<void> {
        const stmt = this.db.prepare(
            "UPDATE participants SET userState = ? WHERE roomId = ? AND userId = ?"
        );
        stmt.run(state, roomId, userId);
    }

/**
 * Constructor for creating a new instance of a class.
 * @param {Database} db - The database to be used by the instance.
 */
    constructor(db: Database) {
        super();
        this.db = db;
        load(db);
    }

/**
 * Asynchronously initializes the database by executing the specified SQLite tables.
 */
    async init() {
        this.db.exec(sqliteTables);
    }

/**
 * Asynchronously closes the database connection.
 */
    async close() {
        this.db.close();
    }

/**
 * Get account by Id
 * @param {UUID} userId - The UUID of the user
 * @returns {Promise<Account | null>} The account object if found, otherwise null
 */
    async getAccountById(userId: UUID): Promise<Account | null> {
        const sql = "SELECT * FROM accounts WHERE id = ?";
        const account = this.db.prepare(sql).get(userId) as Account;
        if (!account) return null;
        if (account) {
            if (typeof account.details === "string") {
                account.details = JSON.parse(
                    account.details as unknown as string
                );
            }
        }
        return account;
    }

/**
 * Asynchronously creates a new account in the database.
 * 
 * @param {Account} account - The account object to be created.
 * @returns {Promise<boolean>} A Promise that resolves to true if the account was successfully created, otherwise false.
 */
    async createAccount(account: Account): Promise<boolean> {
        try {
            const sql =
                "INSERT INTO accounts (id, name, username, email, avatarUrl, details) VALUES (?, ?, ?, ?, ?, ?)";
            this.db
                .prepare(sql)
                .run(
                    account.id ?? v4(),
                    account.name,
                    account.username,
                    account.email,
                    account.avatarUrl,
                    JSON.stringify(account.details)
                );
            return true;
        } catch (error) {
            console.log("Error creating account", error);
            return false;
        }
    }

/**
 * Retrieves actor details for a given room ID.
 * @param {Object} params - The parameters for the function.
 * @param {string} params.roomId - The UUID of the room to retrieve actor details for.
 * @returns {Promise<Actor[]>} - A promise that resolves to an array of Actor objects containing details like id, name, username, and parsed details information.
 */
    async getActorDetails(params: { roomId: UUID }): Promise<Actor[]> {
        const sql = `
      SELECT a.id, a.name, a.username, a.details
      FROM participants p
      LEFT JOIN accounts a ON p.userId = a.id
      WHERE p.roomId = ?
    `;
        const rows = this.db
            .prepare(sql)
            .all(params.roomId) as (Actor | null)[];

        return rows
            .map((row) => {
                if (row === null) {
                    return null;
                }
                return {
                    ...row,
                    details:
                        typeof row.details === "string"
                            ? JSON.parse(row.details)
                            : row.details,
                };
            })
            .filter((row): row is Actor => row !== null);
    }

/**
 * Retrieves memories by room IDs from the database.
 * 
 * @param {Object} params - The parameters for fetching memories.
 * @param {UUID} params.agentId - The ID of the agent.
 * @param {UUID[]} params.roomIds - An array of room IDs to filter memories by.
 * @param {string} params.tableName - The name of the database table to retrieve memories from.
 * @returns {Promise<Memory[]>} An array of memories that match the provided room IDs.
 */
    async getMemoriesByRoomIds(params: {
        agentId: UUID;
        roomIds: UUID[];
        tableName: string;
    }): Promise<Memory[]> {
        if (!params.tableName) {
            // default to messages
            params.tableName = "messages";
        }
        const placeholders = params.roomIds.map(() => "?").join(", ");
        const sql = `SELECT * FROM memories WHERE type = ? AND agentId = ? AND roomId IN (${placeholders})`;
        const queryParams = [
            params.tableName,
            params.agentId,
            ...params.roomIds,
        ];

        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...queryParams) as (Memory & {
            content: string;
        })[];

        return rows.map((row) => ({
            ...row,
            content: JSON.parse(row.content),
        }));
    }

/**
 * Retrieves a memory by its ID from the database.
 *
 * @param {UUID} memoryId - The ID of the memory to retrieve.
 * @returns {Promise<Memory | null>} The memory data if found, or null if not found.
 */
    async getMemoryById(memoryId: UUID): Promise<Memory | null> {
        const sql = "SELECT * FROM memories WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([memoryId]);
        const memory = stmt.get() as Memory | undefined;

        if (memory) {
            return {
                ...memory,
                content: JSON.parse(memory.content as unknown as string),
            };
        }

        return null;
    }

/**
 * Create a new memory in the database.
 * 
 * @param {Memory} memory - The memory object to be created.
 * @param {string} tableName - The name of the table in the database.
 * @returns {Promise<void>} - A promise that resolves when the memory is created.
 */
    async createMemory(memory: Memory, tableName: string): Promise<void> {
        // Delete any existing memory with the same ID first
        // const deleteSql = `DELETE FROM memories WHERE id = ? AND type = ?`;
        // this.db.prepare(deleteSql).run(memory.id, tableName);

        let isUnique = true;

        if (memory.embedding) {
            // Check if a similar memory already exists
            const similarMemories = await this.searchMemoriesByEmbedding(
                memory.embedding,
                {
                    tableName,
                    agentId: memory.agentId,
                    roomId: memory.roomId,
                    match_threshold: 0.95, // 5% similarity threshold
                    count: 1,
                }
            );

            isUnique = similarMemories.length === 0;
        }

        const content = JSON.stringify(memory.content);
        const createdAt = memory.createdAt ?? Date.now();

        // Insert the memory with the appropriate 'unique' value
        const sql = `INSERT OR REPLACE INTO memories (id, type, content, embedding, userId, roomId, agentId, \`unique\`, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        this.db.prepare(sql).run(
            memory.id ?? v4(),
            tableName,
            content,
            new Float32Array(memory.embedding!), // Store as Float32Array
            memory.userId,
            memory.roomId,
            memory.agentId,
            isUnique ? 1 : 0,
            createdAt
        );
    }

/**
 * Asynchronously searches for memories based on the provided parameters.
 * 
 * @param {Object} params - The parameters for searching memories.
 * @param {string} params.tableName - The name of the table to search in.
 * @param {UUID} params.roomId - The UUID of the room to search memories in.
 * @param {UUID} [params.agentId] - Optional: The UUID of the agent associated with the memories.
 * @param {number[]} params.embedding - The embedding vector used for similarity search.
 * @param {number} params.match_threshold - The threshold for similarity matching.
 * @param {number} params.match_count - The number of matching memories to return.
 * @param {boolean} params.unique - Boolean flag to only return unique memories.
 * @returns {Promise<Memory[]>} - A Promise that resolves to an array of Memory objects matching the search criteria.
 */
    async searchMemories(params: {
        tableName: string;
        roomId: UUID;
        agentId?: UUID;
        embedding: number[];
        match_threshold: number;
        match_count: number;
        unique: boolean;
    }): Promise<Memory[]> {
        // Build the query and parameters carefully
        const queryParams = [
            new Float32Array(params.embedding), // Ensure embedding is Float32Array
            params.tableName,
            params.roomId,
        ];

        let sql = `
            SELECT *, vec_distance_L2(embedding, ?) AS similarity
            FROM memories
            WHERE type = ?
            AND roomId = ?`;

        if (params.unique) {
            sql += " AND `unique` = 1";
        }

        if (params.agentId) {
            sql += " AND agentId = ?";
            queryParams.push(params.agentId);
        }
        sql += ` ORDER BY similarity ASC LIMIT ?`; // ASC for lower distance
        queryParams.push(params.match_count.toString()); // Convert number to string

        // Execute the prepared statement with the correct number of parameters
        const memories = this.db.prepare(sql).all(...queryParams) as (Memory & {
            similarity: number;
        })[];

        return memories.map((memory) => ({
            ...memory,
            createdAt:
                typeof memory.createdAt === "string"
                    ? Date.parse(memory.createdAt as string)
                    : memory.createdAt,
            content: JSON.parse(memory.content as unknown as string),
        }));
    }

/**
 * Searches for memories based on the provided embedding and parameters.
 * @param {number[]} embedding The embedding used for matching memories.
 * @param {Object} params The search parameters.
 * @param {number} [params.match_threshold] The threshold for matching similarity.
 * @param {number} [params.count] The maximum number of memories to return.
 * @param {string} [params.roomId] The ID of the room to search memories in.
 * @param {string} params.agentId The ID of the agent associated with the memories.
 * @param {boolean} [params.unique] Flag to specify if only unique memories should be returned.
 * @param {string} params.tableName The name of the table to search memories in.
 * @returns {Promise<Memory[]>} A Promise that resolves to an array of memories matching the criteria.
 */
    async searchMemoriesByEmbedding(
        embedding: number[],
        params: {
            match_threshold?: number;
            count?: number;
            roomId?: UUID;
            agentId: UUID;
            unique?: boolean;
            tableName: string;
        }
    ): Promise<Memory[]> {
        const queryParams = [
            // JSON.stringify(embedding),
            new Float32Array(embedding),
            params.tableName,
            params.agentId,
        ];

        let sql = `
      SELECT *, vec_distance_L2(embedding, ?) AS similarity
      FROM memories
      WHERE embedding IS NOT NULL AND type = ? AND agentId = ?`;

        if (params.unique) {
            sql += " AND `unique` = 1";
        }

        if (params.roomId) {
            sql += " AND roomId = ?";
            queryParams.push(params.roomId);
        }
        sql += ` ORDER BY similarity DESC`;

        if (params.count) {
            sql += " LIMIT ?";
            queryParams.push(params.count.toString());
        }

        const memories = this.db.prepare(sql).all(...queryParams) as (Memory & {
            similarity: number;
        })[];
        return memories.map((memory) => ({
            ...memory,
            createdAt:
                typeof memory.createdAt === "string"
                    ? Date.parse(memory.createdAt as string)
                    : memory.createdAt,
            content: JSON.parse(memory.content as unknown as string),
        }));
    }

/**
 * Retrieves cached embeddings based on specified options.
 * @async
 * @param {Object} opts - The options for retrieving cached embeddings.
 * @param {string} opts.query_table_name - The name of the query table.
 * @param {number} opts.query_threshold - The threshold for the query.
 * @param {string} opts.query_input - The input for the query.
 * @param {string} opts.query_field_name - The name of the query field.
 * @param {string} opts.query_field_sub_name - The sub name of the query field.
 * @param {number} opts.query_match_count - The number of matches for the query.
 * @returns {Promise<Object[]>} An array of objects containing the embedding and Levenshtein score.
 */
    async getCachedEmbeddings(opts: {
        query_table_name: string;
        query_threshold: number;
        query_input: string;
        query_field_name: string;
        query_field_sub_name: string;
        query_match_count: number;
    }): Promise<{ embedding: number[]; levenshtein_score: number }[]> {
        // First get content text and calculate Levenshtein distance
        const sql = `
            WITH content_text AS (
                SELECT
                    embedding,
                    json_extract(
                        json(content),
                        '$.' || ? || '.' || ?
                    ) as content_text
                FROM memories
                WHERE type = ?
                AND json_extract(
                    json(content),
                    '$.' || ? || '.' || ?
                ) IS NOT NULL
            )
            SELECT
                embedding,
                length(?) + length(content_text) - (
                    length(?) + length(content_text) - (
                        length(replace(lower(?), lower(content_text), '')) +
                        length(replace(lower(content_text), lower(?), ''))
                    ) / 2
                ) as levenshtein_score
            FROM content_text
            ORDER BY levenshtein_score ASC
            LIMIT ?
        `;

        const rows = this.db
            .prepare(sql)
            .all(
                opts.query_field_name,
                opts.query_field_sub_name,
                opts.query_table_name,
                opts.query_field_name,
                opts.query_field_sub_name,
                opts.query_input,
                opts.query_input,
                opts.query_input,
                opts.query_input,
                opts.query_match_count
            ) as { embedding: Buffer; levenshtein_score: number }[];

        return rows.map((row) => ({
            embedding: Array.from(new Float32Array(row.embedding as Buffer)),
            levenshtein_score: row.levenshtein_score,
        }));
    }

/**
 * Update the status of a goal in the database.
 * 
 * @param {object} params - The parameters for updating the goal status.
 * @param {string} params.goalId - The ID of the goal to update.
 * @param {string} params.status - The new status of the goal.
 * @returns {Promise<void>} - A promise that resolves when the goal status is updated in the database.
 */
    async updateGoalStatus(params: {
        goalId: UUID;
        status: GoalStatus;
    }): Promise<void> {
        const sql = "UPDATE goals SET status = ? WHERE id = ?";
        this.db.prepare(sql).run(params.status, params.goalId);
    }

/**
 * Logs information into the database.
 * @param {Object} params - The parameters for logging.
 * @param {Object.<string, unknown>} params.body - The data to be logged.
 * @param {UUID} params.userId - The user ID for whom the log is being made.
 * @param {UUID} params.roomId - The room ID where the log is being made.
 * @param {string} params.type - The type of log being made.
 * @returns {Promise<void>}
 */
    async log(params: {
        body: { [key: string]: unknown };
        userId: UUID;
        roomId: UUID;
        type: string;
    }): Promise<void> {
        const sql =
            "INSERT INTO logs (body, userId, roomId, type) VALUES (?, ?, ?, ?)";
        this.db
            .prepare(sql)
            .run(
                JSON.stringify(params.body),
                params.userId,
                params.roomId,
                params.type
            );
    }

/**
 * Retrieve memories based on specified parameters.
 * 
 * @param {Object} params - The parameters for retrieving memories.
 * @param {UUID} params.roomId - The ID of the room for which memories are to be retrieved.
 * @param {number} [params.count] - The number of memories to retrieve.
 * @param {boolean} [params.unique] - Flag to indicate if only unique memories should be retrieved.
 * @param {string} params.tableName - The name of the table in which memories are stored.
 * @param {UUID} params.agentId - The ID of the agent associated with the memories.
 * @param {number} [params.start] - The starting timestamp for memories to be retrieved.
 * @param {number} [params.end] - The ending timestamp for memories to be retrieved.
 * @returns {Promise<Memory[]>} - A promise that resolves to an array of Memory objects.
 */
    async getMemories(params: {
        roomId: UUID;
        count?: number;
        unique?: boolean;
        tableName: string;
        agentId: UUID;
        start?: number;
        end?: number;
    }): Promise<Memory[]> {
        if (!params.tableName) {
            throw new Error("tableName is required");
        }
        if (!params.roomId) {
            throw new Error("roomId is required");
        }
        let sql = `SELECT * FROM memories WHERE type = ? AND agentId = ? AND roomId = ?`;

        const queryParams = [
            params.tableName,
            params.agentId,
            params.roomId,
        ] as any[];

        if (params.unique) {
            sql += " AND `unique` = 1";
        }

        if (params.start) {
            sql += ` AND createdAt >= ?`;
            queryParams.push(params.start);
        }

        if (params.end) {
            sql += ` AND createdAt <= ?`;
            queryParams.push(params.end);
        }

        sql += " ORDER BY createdAt DESC";

        if (params.count) {
            sql += " LIMIT ?";
            queryParams.push(params.count);
        }

        const memories = this.db.prepare(sql).all(...queryParams) as Memory[];

        return memories.map((memory) => ({
            ...memory,
            createdAt:
                typeof memory.createdAt === "string"
                    ? Date.parse(memory.createdAt as string)
                    : memory.createdAt,
            content: JSON.parse(memory.content as unknown as string),
        }));
    }

/**
 * Removes a memory record from the database based on the provided memory ID and table name.
 * @param {UUID} memoryId - The unique identifier of the memory to be removed.
 * @param {string} tableName - The name of the table where the memory record is stored.
 * @returns {Promise<void>} A Promise that resolves once the memory record is successfully removed from the database.
 */
    async removeMemory(memoryId: UUID, tableName: string): Promise<void> {
        const sql = `DELETE FROM memories WHERE type = ? AND id = ?`;
        this.db.prepare(sql).run(tableName, memoryId);
    }

/**
 * Removes all memories for a specific room from the database.
 * @param {UUID} roomId - The ID of the room to remove memories from.
 * @param {string} tableName - The name of the table where memories are stored.
 * @returns {Promise<void>} - A promise that resolves once memories are removed.
 */
    async removeAllMemories(roomId: UUID, tableName: string): Promise<void> {
        const sql = `DELETE FROM memories WHERE type = ? AND roomId = ?`;
        this.db.prepare(sql).run(tableName, roomId);
    }

/**
 * Count the number of memories in a specified room based on given criteria.
 * 
 * @param {UUID} roomId - The unique identifier of the room.
 * @param {boolean} [unique=true] - Flag indicating if only unique memories should be counted.
 * @param {string} [tableName=""] - The table name to use in the query.
 * @returns {Promise<number>} The number of memories matching the specified criteria.
 * @throws {Error} tableName is required if tableName is not provided.
 */
    async countMemories(
        roomId: UUID,
        unique = true,
        tableName = ""
    ): Promise<number> {
        if (!tableName) {
            throw new Error("tableName is required");
        }

        let sql = `SELECT COUNT(*) as count FROM memories WHERE type = ? AND roomId = ?`;
        const queryParams = [tableName, roomId] as string[];

        if (unique) {
            sql += " AND `unique` = 1";
        }

        return (this.db.prepare(sql).get(...queryParams) as { count: number })
            .count;
    }

/**
 * Retrieves a list of goals based on the provided parameters.
 * 
 * @param {Object} params - The parameters for filtering the goals.
 * @param {UUID} params.roomId - The ID of the room to retrieve goals for.
 * @param {UUID | null} [params.userId] - Optional. The ID of the user to filter goals by.
 * @param {boolean} [params.onlyInProgress] - Optional. Whether to only retrieve goals that are in progress.
 * @param {number} [params.count] - Optional. The maximum number of goals to retrieve.
 * @returns {Promise<Goal[]>} The list of goals that match the provided parameters.
 */
    async getGoals(params: {
        roomId: UUID;
        userId?: UUID | null;
        onlyInProgress?: boolean;
        count?: number;
    }): Promise<Goal[]> {
        let sql = "SELECT * FROM goals WHERE roomId = ?";
        const queryParams = [params.roomId];

        if (params.userId) {
            sql += " AND userId = ?";
            queryParams.push(params.userId);
        }

        if (params.onlyInProgress) {
            sql += " AND status = 'IN_PROGRESS'";
        }

        if (params.count) {
            sql += " LIMIT ?";
            // @ts-expect-error - queryParams is an array of strings
            queryParams.push(params.count.toString());
        }

        const goals = this.db.prepare(sql).all(...queryParams) as Goal[];
        return goals.map((goal) => ({
            ...goal,
            objectives:
                typeof goal.objectives === "string"
                    ? JSON.parse(goal.objectives)
                    : goal.objectives,
        }));
    }

/**
 * Updates a goal in the database with the provided data.
 * 
 * @param {Goal} goal - The goal object containing the updated information.
 * @returns {Promise<void>} - A Promise that resolves when the update is completed.
 */
    async updateGoal(goal: Goal): Promise<void> {
        const sql =
            "UPDATE goals SET name = ?, status = ?, objectives = ? WHERE id = ?";
        this.db
            .prepare(sql)
            .run(
                goal.name,
                goal.status,
                JSON.stringify(goal.objectives),
                goal.id
            );
    }

/**
 * Creates a new goal in the database
 * 
 * @param {Goal} goal - The goal object to be created
 * @returns {Promise<void>} - A promise that resolves once the goal is created
 */
    async createGoal(goal: Goal): Promise<void> {
        const sql =
            "INSERT INTO goals (id, roomId, userId, name, status, objectives) VALUES (?, ?, ?, ?, ?, ?)";
        this.db
            .prepare(sql)
            .run(
                goal.id ?? v4(),
                goal.roomId,
                goal.userId,
                goal.name,
                goal.status,
                JSON.stringify(goal.objectives)
            );
    }

/**
 * Removes a goal from the database.
 * 
 * @param {UUID} goalId - The ID of the goal to be removed.
 * @returns {Promise<void>} A Promise that resolves when the goal is successfully removed.
 */
    async removeGoal(goalId: UUID): Promise<void> {
        const sql = "DELETE FROM goals WHERE id = ?";
        this.db.prepare(sql).run(goalId);
    }

/**
 * Remove all goals from the database for a specific room.
 * @param {UUID} roomId - The unique identifier of the room.
 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
 */
    async removeAllGoals(roomId: UUID): Promise<void> {
        const sql = "DELETE FROM goals WHERE roomId = ?";
        this.db.prepare(sql).run(roomId);
    }

/**
 * Creates a new room with the specified room ID or generates a random UUID if none is provided.
 * 
 * @param {UUID} roomId - The ID of the room to create, or undefined to generate a new UUID.
 * @returns {Promise<UUID>} The UUID of the created room.
 */
    async createRoom(roomId?: UUID): Promise<UUID> {
        roomId = roomId || (v4() as UUID);
        try {
            const sql = "INSERT INTO rooms (id) VALUES (?)";
            this.db.prepare(sql).run(roomId ?? (v4() as UUID));
        } catch (error) {
            console.log("Error creating room", error);
        }
        return roomId as UUID;
    }

/**
 * Removes a room from the database based on the room ID.
 * 
 * @async
 * @param {UUID} roomId - The ID of the room to be removed.
 * @returns {Promise<void>}
 */
    async removeRoom(roomId: UUID): Promise<void> {
        const sql = "DELETE FROM rooms WHERE id = ?";
        this.db.prepare(sql).run(roomId);
    }

/**
 * Retrieves the rooms associated with a specific participant.
 * @param {UUID} userId - The identifier of the participant.
 * @returns {Promise<UUID[]>} An array of room IDs associated with the participant.
 */
    async getRoomsForParticipant(userId: UUID): Promise<UUID[]> {
        const sql = "SELECT roomId FROM participants WHERE userId = ?";
        const rows = this.db.prepare(sql).all(userId) as { roomId: string }[];
        return rows.map((row) => row.roomId as UUID);
    }

/**
 * Retrieves a list of room IDs based on the provided array of user IDs.
 * @param {UUID[]} userIds - An array of UUID strings representing user IDs.
 * @returns {Promise<UUID[]>} A promise that resolves with an array of room IDs as UUIDs.
 */
    async getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]> {
        // Assuming userIds is an array of UUID strings, prepare a list of placeholders
        const placeholders = userIds.map(() => "?").join(", ");
        // Construct the SQL query with the correct number of placeholders
        const sql = `SELECT DISTINCT roomId FROM participants WHERE userId IN (${placeholders})`;
        // Execute the query with the userIds array spread into arguments
        const rows = this.db.prepare(sql).all(...userIds) as {
            roomId: string;
        }[];
        // Map and return the roomId values as UUIDs
        return rows.map((row) => row.roomId as UUID);
    }

/**
 * Add a participant to a room.
 * 
 * @param {UUID} userId - The UUID of the user to add as a participant.
 * @param {UUID} roomId - The UUID of the room to add the user to.
 * @returns {Promise<boolean>} Returns a promise that resolves to true if the participant was added successfully, false otherwise.
 */
    async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        try {
            const sql =
                "INSERT INTO participants (id, userId, roomId) VALUES (?, ?, ?)";
            this.db.prepare(sql).run(v4(), userId, roomId);
            return true;
        } catch (error) {
            console.log("Error adding participant", error);
            return false;
        }
    }

/**
 * Removes a participant from a room in the database.
 * @param {UUID} userId - The unique identifier of the user to be removed.
 * @param {UUID} roomId - The unique identifier of the room from which the user will be removed.
 * @returns {Promise<boolean>} - Returns a boolean indicating the success of the removal operation.
 */
    async removeParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        try {
            const sql =
                "DELETE FROM participants WHERE userId = ? AND roomId = ?";
            this.db.prepare(sql).run(userId, roomId);
            return true;
        } catch (error) {
            console.log("Error removing participant", error);
            return false;
        }
    }

/**
 * Asynchronously creates a relationship between two users in the database.
 * 
 * @param {Object} params - The parameters for creating the relationship.
 * @param {UUID} params.userA - The UUID of the first user.
 * @param {UUID} params.userB - The UUID of the second user.
 * 
 * @returns {Promise<boolean>} Returns a Promise that resolves to true if the relationship was successfully created.
 * 
 * @throws {Error} If either userA or userB is missing in the parameters.
 */
    async createRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<boolean> {
        if (!params.userA || !params.userB) {
            throw new Error("userA and userB are required");
        }
        const sql =
            "INSERT INTO relationships (id, userA, userB, userId) VALUES (?, ?, ?, ?)";
        this.db
            .prepare(sql)
            .run(v4(), params.userA, params.userB, params.userA);
        return true;
    }

/**
 * Retrieve a relationship between two users from the database.
 * @param {Object} params - The parameters for the relationship query.
 * @param {UUID} params.userA - The UUID of user A.
 * @param {UUID} params.userB - The UUID of user B.
 * @returns {Promise<Relationship | null>} A promise that resolves to the relationship between userA and userB, or null if no relationship is found.
 */
    async getRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<Relationship | null> {
        const sql =
            "SELECT * FROM relationships WHERE (userA = ? AND userB = ?) OR (userA = ? AND userB = ?)";
        return (
            (this.db
                .prepare(sql)
                .get(
                    params.userA,
                    params.userB,
                    params.userB,
                    params.userA
                ) as Relationship) || null
        );
    }

/**
 * Fetches relationships for a specified user ID from the database
 * @param {Object} params - The parameters for the query
 * @param {UUID} params.userId - The ID of the user to fetch relationships for
 * @returns {Promise<Relationship[]>} - A promise that resolves to an array of Relationship objects
 */
    async getRelationships(params: { userId: UUID }): Promise<Relationship[]> {
        const sql =
            "SELECT * FROM relationships WHERE (userA = ? OR userB = ?)";
        return this.db
            .prepare(sql)
            .all(params.userId, params.userId) as Relationship[];
    }

/**
 * Get cache value from the database.
 * @param {Object} params - The parameters for the cache retrieval.
 * @param {string} params.key - The key of the cache entry.
 * @param {UUID} params.agentId - The ID of the agent associated with the cache entry.
 * @returns {Promise<string | undefined>} The value of the cache entry, or undefined if not found.
 */
    async getCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<string | undefined> {
        const sql = "SELECT value FROM cache WHERE (key = ? AND agentId = ?)";
        const cached = this.db
            .prepare<[string, UUID], { value: string }>(sql)
            .get(params.key, params.agentId);

        return cached?.value ?? undefined;
    }

/**
 * Asynchronously sets a value in the cache.
 * 
 * @param {Object} params - The parameters for setting the cache value.
 * @param {string} params.key - The key for the cache entry.
 * @param {UUID} params.agentId - The ID of the agent associated with the cache entry.
 * @param {string} params.value - The value to be stored in the cache.
 * @returns {Promise<boolean>} A Promise that resolves to true if the value was successfully set in the cache.
 */
    async setCache(params: {
        key: string;
        agentId: UUID;
        value: string;
    }): Promise<boolean> {
        const sql =
            "INSERT OR REPLACE INTO cache (key, agentId, value, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
        this.db.prepare(sql).run(params.key, params.agentId, params.value);
        return true;
    }

/**
 * Deletes cache based on provided key and agentId.
 * 
 * @param {Object} params - The parameters for deleting cache.
 * @param {string} params.key - The key of the cache to be deleted.
 * @param {UUID} params.agentId - The agentId associated with the cache.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure of cache deletion.
 */
    async deleteCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<boolean> {
        try {
            const sql = "DELETE FROM cache WHERE key = ? AND agentId = ?";
            this.db.prepare(sql).run(params.key, params.agentId);
            return true;
        } catch (error) {
            console.log("Error removing cache", error);
            return false;
        }
    }
}
