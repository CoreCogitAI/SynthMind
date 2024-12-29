export * from "./sqliteTables.ts";
export * from "./types.ts";

import {
    Account,
    Actor,
    DatabaseAdapter,
    GoalStatus,
    IDatabaseCacheAdapter,
    Participant,
    type Goal,
    type Memory,
    type Relationship,
    type UUID,
} from "@elizaos/core";
import { v4 } from "uuid";
import { sqliteTables } from "./sqliteTables.ts";
import { Database } from "./types.ts";

/**
 * Class representing a SQLite database adapter for a specific schema.
 * @extends DatabaseAdapter
 * @implements IDatabaseCacheAdapter
 */
 */
export class SqlJsDatabaseAdapter
    extends DatabaseAdapter<Database>
    implements IDatabaseCacheAdapter
{
/**
 * Constructor for creating a new instance of the class.
 * @param {Database} db - The database instance to be used
 */
    constructor(db: Database) {
        super();
        this.db = db;
    }

/**
 * Initializes the database by executing the provided SQLite tables.
 */
    async init() {
        this.db.exec(sqliteTables);
    }

/**
 * Closes the connection to the database.
 */
    async close() {
        this.db.close();
    }

/**
 * Retrieves the UUID of a room based on the given roomId.
 * 
 * @param {UUID} roomId - The unique identifier of the room.
 * @returns {Promise<UUID | null>} The UUID of the room if found, otherwise null.
 */
    async getRoom(roomId: UUID): Promise<UUID | null> {
        const sql = "SELECT id FROM rooms WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([roomId]);
        const room = stmt.getAsObject() as { id: string } | undefined;
        stmt.free();
        return room ? (room.id as UUID) : null;
    }

/**
 * Retrieves the list of participants associated with a specific user account.
 * 
 * @param {UUID} userId - ID of the user account to retrieve participants for
 * @returns {Promise<Participant[]>} - A promise that resolves with an array of Participant objects
 */
    async getParticipantsForAccount(userId: UUID): Promise<Participant[]> {
        const sql = `
      SELECT p.id, p.userId, p.roomId, p.last_message_read
      FROM participants p
      WHERE p.userId = ?
    `;
        const stmt = this.db.prepare(sql);
        stmt.bind([userId]);
        const participants: Participant[] = [];
        while (stmt.step()) {
            const participant = stmt.getAsObject() as unknown as Participant;
            participants.push(participant);
        }
        stmt.free();
        return participants;
    }

/**
 * Retrieves the state of a participant user in a specific room.
 * @param {UUID} roomId The ID of the room to look up the participant user state in.
 * @param {UUID} userId The ID of the participant user to retrieve the state for.
 * @returns {Promise<"FOLLOWED" | "MUTED" | null>} The user state of the participant user in the room (either "FOLLOWED", "MUTED", or null if not found).
 */
    async getParticipantUserState(
        roomId: UUID,
        userId: UUID
    ): Promise<"FOLLOWED" | "MUTED" | null> {
        const sql =
            "SELECT userState FROM participants WHERE roomId = ? AND userId = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([roomId, userId]);
        const result = stmt.getAsObject() as {
            userState: "FOLLOWED" | "MUTED" | null;
        };
        stmt.free();
        return result.userState ?? null;
    }

/**
 * Retrieves memories by room IDs from the database.
 * 
 * @param {Object} params - The parameters for retrieving memories.
 * @param {UUID} params.agentId - The ID of the agent.
 * @param {UUID[]} params.roomIds - The IDs of the rooms to retrieve memories from.
 * @param {string} params.tableName - The name of the table to retrieve memories from.
 * @returns {Promise<Memory[]>} The memories retrieved from the database.
 */
    async getMemoriesByRoomIds(params: {
        agentId: UUID;
        roomIds: UUID[];
        tableName: string;
    }): Promise<Memory[]> {
        const placeholders = params.roomIds.map(() => "?").join(", ");
        const sql = `SELECT * FROM memories WHERE 'type' = ? AND agentId = ? AND roomId IN (${placeholders})`;
        const stmt = this.db.prepare(sql);
        const queryParams = [
            params.tableName,
            params.agentId,
            ...params.roomIds,
        ];
        console.log({ queryParams });
        stmt.bind(queryParams);
        console.log({ queryParams });

        const memories: Memory[] = [];
        while (stmt.step()) {
            const memory = stmt.getAsObject() as unknown as Memory;
            memories.push({
                ...memory,
                content: JSON.parse(memory.content as unknown as string),
            });
        }
        stmt.free();
        return memories;
    }

/**
 * Updates the user state for a participant in a specified room.
 * 
 * @param {UUID} roomId - The ID of the room where the participant is located.
 * @param {UUID} userId - The ID of the user whose state is being updated.
 * @param {"FOLLOWED" | "MUTED" | null} state - The new state to set for the user. Can be "FOLLOWED", "MUTED", or null.
 * @returns {Promise<void>} A Promise that resolves when the user state has been updated.
 */
    async setParticipantUserState(
        roomId: UUID,
        userId: UUID,
        state: "FOLLOWED" | "MUTED" | null
    ): Promise<void> {
        const sql =
            "UPDATE participants SET userState = ? WHERE roomId = ? AND userId = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([state, roomId, userId]);
        stmt.step();
        stmt.free();
    }

/**
 * Asynchronously fetches and returns an array of UUIDs of participants for a specific room.
 *
 * @param {UUID} roomId - The UUID of the room to fetch participants for.
 * @returns {Promise<UUID[]>} The array of UUIDs of participants for the specified room.
 */
    async getParticipantsForRoom(roomId: UUID): Promise<UUID[]> {
        const sql = "SELECT userId FROM participants WHERE roomId = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([roomId]);
        const userIds: UUID[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject() as { userId: string };
            userIds.push(row.userId as UUID);
        }
        stmt.free();
        return userIds;
    }

/**
 * Retrieves an account by the specified user ID.
 * @param {UUID} userId - The ID of the user to retrieve the account for.
 * @returns {Promise<Account | null>} The account object corresponding to the user ID, or null if not found.
 */
    async getAccountById(userId: UUID): Promise<Account | null> {
        const sql = "SELECT * FROM accounts WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([userId]);
        const account = stmt.getAsObject() as unknown as Account | undefined;

        if (account && typeof account.details === "string") {
            account.details = JSON.parse(account.details);
        }

        stmt.free();
        return account || null;
    }

/**
 * Asynchronously creates a new account in the database.
 *
 * @param {Account} account - The account object to be created.
 * @returns {Promise<boolean>} - A promise that resolves to true if the account was created successfully, false otherwise.
 */
    async createAccount(account: Account): Promise<boolean> {
        try {
            const sql = `
      INSERT INTO accounts (id, name, username, email, avatarUrl, details)
      VALUES (?, ?, ?, ?, ?, ?)
      `;
            const stmt = this.db.prepare(sql);
            stmt.run([
                account.id ?? v4(),
                account.name,
                account.username || "",
                account.email || "",
                account.avatarUrl || "",
                JSON.stringify(account.details),
            ]);
            stmt.free();
            return true;
        } catch (error) {
            console.log("Error creating account", error);
            return false;
        }
    }

/**
 * Get actor by ID from the database
 * 
 * @param {Object} params - The parameters for getting the actor by ID
 * @param {string} params.roomId - The UUID of the room
 * @returns {Promise<Actor[]>} The list of actors from the database
 */
    async getActorById(params: { roomId: UUID }): Promise<Actor[]> {
        const sql = `
      SELECT a.id, a.name, a.username, a.details
      FROM participants p
      LEFT JOIN accounts a ON p.userId = a.id
      WHERE p.roomId = ?
    `;
        const stmt = this.db.prepare(sql);
        stmt.bind([params.roomId]);
        const rows: Actor[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject() as unknown as Actor;
            rows.push({
                ...row,
                details:
                    typeof row.details === "string"
                        ? JSON.parse(row.details)
                        : row.details,
            });
        }
        stmt.free();
        return rows;
    }

/**
 * Retrieves details of all actors in a specific room based on room ID.
 *
 * @param {Object} params - The parameters for getting actor details.
 * @param {string} params.roomId - The room ID to fetch actor details for.
 * @returns {Promise<Actor[]>} An array of Actor objects with their details.
 */
    async getActorDetails(params: { roomId: UUID }): Promise<Actor[]> {
        const sql = `
      SELECT a.id, a.name, a.username, a.details
      FROM participants p
      LEFT JOIN accounts a ON p.userId = a.id
      WHERE p.roomId = ?
    `;
        const stmt = this.db.prepare(sql);
        stmt.bind([params.roomId]);
        const rows: Actor[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject() as unknown as Actor;
            rows.push({
                ...row,
                details:
                    typeof row.details === "string"
                        ? JSON.parse(row.details)
                        : row.details,
            });
        }
        stmt.free();
        return rows;
    }

/**
 * Fetches a memory from the database by its ID.
 *
 * @param {UUID} id - The unique identifier of the memory to retrieve.
 * @returns {Promise<Memory|null>} A Promise that resolves with the Memory object if found, or null if not found.
 */
    async getMemoryById(id: UUID): Promise<Memory | null> {
        const sql = "SELECT * FROM memories WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([id]);
        const memory = stmt.getAsObject() as unknown as Memory | undefined;
        stmt.free();
        return memory || null;
    }

/**
 * Asynchronously creates a new memory in the database.
 * @param {Memory} memory - The memory object to be created.
 * @param {string} tableName - The name of the table where the memory will be inserted.
 * @returns {Promise<void>} A promise that resolves with no value once the memory is created.
 */
    async createMemory(memory: Memory, tableName: string): Promise<void> {
        let isUnique = true;
        if (memory.embedding) {
            // Check if a similar memory already exists
            const similarMemories = await this.searchMemoriesByEmbedding(
                memory.embedding,
                {
                    agentId: memory.agentId,
                    tableName,
                    roomId: memory.roomId,
                    match_threshold: 0.95, // 5% similarity threshold
                    count: 1,
                }
            );

            isUnique = similarMemories.length === 0;
        }

        // Insert the memory with the appropriate 'unique' value
        const sql = `INSERT INTO memories (id, type, content, embedding, userId, roomId, agentId, \`unique\`, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const stmt = this.db.prepare(sql);

        const createdAt = memory.createdAt ?? Date.now();

        stmt.run([
            memory.id ?? v4(),
            tableName,
            JSON.stringify(memory.content),
            JSON.stringify(memory.embedding),
            memory.userId,
            memory.roomId,
            memory.agentId,
            isUnique ? 1 : 0,
            createdAt,
        ]);
        stmt.free();
    }

/**
 * Asynchronously searches for memories based on the given parameters.
 * 
 * @param {Object} params - The parameters for the search query.
 * @param {string} params.tableName - The name of the table to search in.
 * @param {UUID} params.agentId - The ID of the agent associated with the memories.
 * @param {UUID} params.roomId - The ID of the room associated with the memories.
 * @param {number[]} params.embedding - The embedding vector for similarity comparison.
 * @param {number} params.match_threshold - The threshold for similarity match.
 * @param {number} params.match_count - The number of matches to retrieve.
 * @param {boolean} params.unique - Flag indicating whether to retrieve unique memories only.
 * @returns {Promise<Memory[]>} - A promise that resolves with an array of matched memories.
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
        let sql =
            `
  SELECT *` +
            // TODO: Uncomment when we compile sql.js with vss
            // `, (1 - vss_distance_l2(embedding, ?)) AS similarity` +
            ` FROM memories
  WHERE type = ? AND agentId = ?
  AND roomId = ?`;

        if (params.unique) {
            sql += " AND `unique` = 1";
        }
        // TODO: Uncomment when we compile sql.js with vss
        // sql += ` ORDER BY similarity DESC LIMIT ?`;
        const stmt = this.db.prepare(sql);
        stmt.bind([
            // JSON.stringify(params.embedding),
            params.tableName,
            params.agentId,
            params.roomId,
            // params.match_count,
        ]);
        const memories: (Memory & { similarity: number })[] = [];
        while (stmt.step()) {
            const memory = stmt.getAsObject() as unknown as Memory & {
                similarity: number;
            };
            memories.push({
                ...memory,
                content: JSON.parse(memory.content as unknown as string),
            });
        }
        stmt.free();
        return memories;
    }

/**
 * Search for memories based on embedding similarity.
 * 
 * @param {number[]} _embedding - Array of numbers representing the embedding to search for.
 * @param {object} params - Parameters for the search query.
 * @param {UUID} params.agentId - The ID of the agent associated with the memories.
 * @param {number} [params.match_threshold] - The threshold for similarity match.
 * @param {number} [params.count] - The maximum number of memories to return.
 * @param {UUID} [params.roomId] - The ID of the room associated with the memories.
 * @param {boolean} [params.unique] - Whether to only return unique memories.
 * @param {string} params.tableName - The name of the table to query from.
 * @returns {Promise<Memory[]>} - A promise that resolves to an array of Memory objects.
 */
    async searchMemoriesByEmbedding(
        _embedding: number[],
        params: {
            agentId: UUID;
            match_threshold?: number;
            count?: number;
            roomId?: UUID;
            unique?: boolean;
            tableName: string;
        }
    ): Promise<Memory[]> {
        let sql =
            `SELECT *` +
            // TODO: Uncomment when we compile sql.js with vss
            // `, (1 - vss_distance_l2(embedding, ?)) AS similarity`+
            ` FROM memories
        WHERE type = ? AND agentId = ?`;

        if (params.unique) {
            sql += " AND `unique` = 1";
        }
        if (params.roomId) {
            sql += " AND roomId = ?";
        }
        // TODO: Test this
        if (params.agentId) {
            sql += " AND userId = ?";
        }
        // TODO: Uncomment when we compile sql.js with vss
        // sql += ` ORDER BY similarity DESC`;

        if (params.count) {
            sql += " LIMIT ?";
        }

        const stmt = this.db.prepare(sql);
        const bindings = [
            // JSON.stringify(embedding),
            params.tableName,
            params.agentId,
        ];
        if (params.roomId) {
            bindings.push(params.roomId);
        }
        if (params.count) {
            bindings.push(params.count.toString());
        }

        stmt.bind(bindings);
        const memories: (Memory & { similarity: number })[] = [];
        while (stmt.step()) {
            const memory = stmt.getAsObject() as unknown as Memory & {
                similarity: number;
            };
            memories.push({
                ...memory,
                content: JSON.parse(memory.content as unknown as string),
            });
        }
        stmt.free();
        return memories;
    }

/**
 * Asynchronously retrieves cached embeddings based on the provided query options.
 * 
 * @param {Object} opts - The query options.
 * @param {string} opts.query_table_name - The name of the table to query.
 * @param {number} opts.query_threshold - The threshold for the query.
 * @param {string} opts.query_input - The input for the query.
 * @param {string} opts.query_field_name - The name of the field to query.
 * @param {string} opts.query_field_sub_name - The sub name of the field to query.
 * @param {number} opts.query_match_count - The match count for the query.
 * @returns {Promise<Array<{
 *     embedding: number[];
 *     levenshtein_score: number;
 * }>>} - The array of objects containing the embeddings and Levenshtein scores.
 */
    async getCachedEmbeddings(opts: {
        query_table_name: string;
        query_threshold: number;
        query_input: string;
        query_field_name: string;
        query_field_sub_name: string;
        query_match_count: number;
    }): Promise<
        {
            embedding: number[];
            levenshtein_score: number;
        }[]
    > {
        const sql =
            `
        SELECT *
        FROM memories
        WHERE type = ?` +
            // `AND vss_search(${opts.query_field_name}, ?)
            // ORDER BY vss_search(${opts.query_field_name}, ?) DESC` +
            ` LIMIT ?
      `;
        const stmt = this.db.prepare(sql);
        stmt.bind([
            opts.query_table_name,
            // opts.query_input,
            // opts.query_input,
            opts.query_match_count,
        ]);
        const memories: Memory[] = [];
        while (stmt.step()) {
            const memory = stmt.getAsObject() as unknown as Memory;
            memories.push(memory);
        }
        stmt.free();

        return memories.map((memory) => ({
            ...memory,
            createdAt: memory.createdAt ?? Date.now(),
            embedding: JSON.parse(memory.embedding as unknown as string),
            levenshtein_score: 0,
        }));
    }

/**
 * Update the status of a goal in the database.
 *
 * @param {Object} params - The parameters for updating the goal status.
 * @param {UUID} params.goalId - The ID of the goal to update.
 * @param {GoalStatus} params.status - The new status for the goal.
 * @returns {Promise<void>} - A promise that resolves when the status is updated.
 */
    async updateGoalStatus(params: {
        goalId: UUID;
        status: GoalStatus;
    }): Promise<void> {
        const sql = "UPDATE goals SET status = ? WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.run([params.status, params.goalId]);
        stmt.free();
    }

/**
 * Logs data to the database.
 * 
 * @param {Object} params - The parameters for logging.
 * @param {Object.<string, unknown>} params.body - The data to log.
 * @param {string} params.userId - The user ID associated with the log.
 * @param {string} params.roomId - The room ID associated with the log.
 * @param {string} params.type - The type of log entry.
 * @returns {Promise<void>} - A Promise that resolves when the logging is complete.
 */
    async log(params: {
        body: { [key: string]: unknown };
        userId: UUID;
        roomId: UUID;
        type: string;
    }): Promise<void> {
        const sql =
            "INSERT INTO logs (body, userId, roomId, type) VALUES (?, ?, ?, ?)";
        const stmt = this.db.prepare(sql);
        stmt.run([
            JSON.stringify(params.body),
            params.userId,
            params.roomId,
            params.type,
        ]);
        stmt.free();
    }

/**
 * Retrieves memories based on the provided parameters.
 * @param {Object} params - The parameters for retrieving memories.
 * @param {UUID} params.roomId - The ID of the room.
 * @param {number} [params.count] - The maximum number of memories to retrieve.
 * @param {boolean} [params.unique] - Indicates if only unique memories should be retrieved.
 * @param {string} params.tableName - The name of the table where memories are stored.
 * @param {UUID} [params.agentId] - The ID of the agent associated with the memories.
 * @param {number} [params.start] - The start timestamp for filtering memories.
 * @param {number} [params.end] - The end timestamp for filtering memories.
 * @returns {Promise<Memory[]>} The array of memories that match the criteria.
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
        if (!params.tableName) {
            throw new Error("tableName is required");
        }
        if (!params.roomId) {
            throw new Error("roomId is required");
        }
        let sql = `SELECT * FROM memories WHERE type = ? AND roomId = ?`;

        if (params.start) {
            sql += ` AND createdAt >= ?`;
        }

        if (params.end) {
            sql += ` AND createdAt <= ?`;
        }

        if (params.unique) {
            sql += " AND `unique` = 1";
        }

        if (params.agentId) {
            sql += " AND agentId = ?";
        }

        sql += " ORDER BY createdAt DESC";

        if (params.count) {
            sql += " LIMIT ?";
        }

        const stmt = this.db.prepare(sql);
        stmt.bind([
            params.tableName,
            params.roomId,
            ...(params.start ? [params.start] : []),
            ...(params.end ? [params.end] : []),
            ...(params.agentId ? [params.agentId] : []),
            ...(params.count ? [params.count] : []),
        ]);
        const memories: Memory[] = [];
        while (stmt.step()) {
            const memory = stmt.getAsObject() as unknown as Memory;
            memories.push({
                ...memory,
                content: JSON.parse(memory.content as unknown as string),
            });
        }
        stmt.free();
        return memories;
    }

/**
 * Remove a memory from the database.
 * 
 * @param {UUID} memoryId - The ID of the memory to be removed.
 * @param {string} tableName - The name of the table where the memory is stored.
 * 
 * @returns {Promise<void>} A promise that resolves when the memory is successfully removed.
 */
    async removeMemory(memoryId: UUID, tableName: string): Promise<void> {
        const sql = `DELETE FROM memories WHERE type = ? AND id = ?`;
        const stmt = this.db.prepare(sql);
        stmt.run([tableName, memoryId]);
        stmt.free();
    }

/**
 * Removes all memories from the specified table in a given room.
 * 
 * @param {UUID} roomId - The unique identifier of the room where memories are stored
 * @param {string} tableName - The name of the table containing memories to be removed
 * @returns {Promise<void>} - A Promise that resolves when the memories are successfully removed
 */
    async removeAllMemories(roomId: UUID, tableName: string): Promise<void> {
        const sql = `DELETE FROM memories WHERE type = ? AND roomId = ?`;
        const stmt = this.db.prepare(sql);
        stmt.run([tableName, roomId]);
        stmt.free();
    }

/**
 * Count the number of memories in a given room.
 * 
 * @param {UUID} roomId - The ID of the room.
 * @param {boolean} [unique=true] - Flag to indicate if only unique memories should be counted.
 * @param {string} [tableName=""] - The name of the table in the database.
 * @returns {Promise<number>} The number of memories that meet the specified criteria.
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
        if (unique) {
            sql += " AND `unique` = 1";
        }

        const stmt = this.db.prepare(sql);
        stmt.bind([tableName, roomId]);

        let count = 0;
        if (stmt.step()) {
            const result = stmt.getAsObject() as { count: number };
            count = result.count;
        }

        stmt.free();
        return count;
    }

/**
 * Retrieves goals based on the specified parameters.
 * 
 * @param {{
 *      roomId: UUID;
 *      userId?: UUID | null;
 *      onlyInProgress?: boolean;
 *      count?: number;
 * }} params - The parameters for filtering the goals.
 * @returns {Promise<Goal[]>} The list of goals that match the specified criteria.
 */
    async getGoals(params: {
        roomId: UUID;
        userId?: UUID | null;
        onlyInProgress?: boolean;
        count?: number;
    }): Promise<Goal[]> {
        let sql = "SELECT * FROM goals WHERE roomId = ?";
        const bindings: (string | number)[] = [params.roomId];

        if (params.userId) {
            sql += " AND userId = ?";
            bindings.push(params.userId);
        }

        if (params.onlyInProgress) {
            sql += " AND status = 'IN_PROGRESS'";
        }

        if (params.count) {
            sql += " LIMIT ?";
            bindings.push(params.count.toString());
        }

        const stmt = this.db.prepare(sql);
        stmt.bind(bindings);
        const goals: Goal[] = [];
        while (stmt.step()) {
            const goal = stmt.getAsObject() as unknown as Goal;
            goals.push({
                ...goal,
                objectives:
                    typeof goal.objectives === "string"
                        ? JSON.parse(goal.objectives)
                        : goal.objectives,
            });
        }
        stmt.free();
        return goals;
    }

/**
 * Asynchronously updates a goal in the database.
 * 
 * @param {Goal} goal - The goal object to be updated.
 * @returns {Promise<void>}
 */
    async updateGoal(goal: Goal): Promise<void> {
        const sql =
            "UPDATE goals SET name = ?, status = ?, objectives = ? WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.run([
            goal.name,
            goal.status,
            JSON.stringify(goal.objectives),
            goal.id as string,
        ]);
        stmt.free();
    }

/**
 * Asynchronously creates a new goal in the database.
 * 
 * @param {Goal} goal The goal object to be created.
 * @returns {Promise<void>} A Promise that resolves when the goal is successfully created.
 */
    async createGoal(goal: Goal): Promise<void> {
        const sql =
            "INSERT INTO goals (id, roomId, userId, name, status, objectives) VALUES (?, ?, ?, ?, ?, ?)";
        const stmt = this.db.prepare(sql);
        stmt.run([
            goal.id ?? v4(),
            goal.roomId,
            goal.userId,
            goal.name,
            goal.status,
            JSON.stringify(goal.objectives),
        ]);
        stmt.free();
    }

/**
 * Removes a goal from the database.
 * 
 * @param {UUID} goalId - The unique identifier of the goal to be removed.
 * @returns {Promise<void>} A Promise that resolves when the goal is successfully removed.
 */
    async removeGoal(goalId: UUID): Promise<void> {
        const sql = "DELETE FROM goals WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.run([goalId]);
        stmt.free();
    }

/**
 * Removes all goals associated with a specific room from the database.
 * @param {UUID} roomId - The unique identifier of the room for which goals will be removed.
 * @returns {Promise<void>} - A Promise that resolves when the goals are successfully removed.
 */
    async removeAllGoals(roomId: UUID): Promise<void> {
        const sql = "DELETE FROM goals WHERE roomId = ?";
        const stmt = this.db.prepare(sql);
        stmt.run([roomId]);
        stmt.free();
    }

/**
 * Asynchronously creates a new room with the given roomId or generate a new UUID if not provided.
 * 
 * @param {UUID} [roomId] - Optional roomId to use for the new room. If not provided, a new UUID will be generated.
 * @returns {Promise<UUID>} The UUID of the newly created room.
 */
    async createRoom(roomId?: UUID): Promise<UUID> {
        roomId = roomId || (v4() as UUID);
        try {
            const sql = "INSERT INTO rooms (id) VALUES (?)";
            const stmt = this.db.prepare(sql);
            stmt.run([roomId ?? (v4() as UUID)]);
            stmt.free();
        } catch (error) {
            console.log("Error creating room", error);
        }
        return roomId as UUID;
    }

/**
 * Removes a room from the database based on the given roomId.
 *
 * @param {UUID} roomId - The unique identifier of the room to be removed.
 * @returns {Promise<void>} A Promise that resolves when the room is successfully removed.
 */
    async removeRoom(roomId: UUID): Promise<void> {
        const sql = "DELETE FROM rooms WHERE id = ?";
        const stmt = this.db.prepare(sql);
        stmt.run([roomId]);
        stmt.free();
    }

/**
 * Get the list of rooms associated with a specific participant.
 *
 * @param {UUID} userId - The unique identifier of the participant.
 * @returns {Promise<UUID[]>} - A promise that resolves to an array of room IDs.
 */
    async getRoomsForParticipant(userId: UUID): Promise<UUID[]> {
        const sql = "SELECT roomId FROM participants WHERE userId = ?";
        const stmt = this.db.prepare(sql);
        stmt.bind([userId]);
        const rows: { roomId: string }[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject() as unknown as { roomId: string };
            rows.push(row);
        }
        stmt.free();
        return rows.map((row) => row.roomId as UUID);
    }

/**
 * Asynchronously retrieves a list of rooms for given participants based on their userIds.
 * @param {UUID[]} userIds - An array of UUID strings representing user identifiers.
 * @returns {Promise<UUID[]>} A Promise that resolves to an array of UUID strings representing room identifiers.
 */
    async getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]> {
        // Assuming userIds is an array of UUID strings, prepare a list of placeholders
        const placeholders = userIds.map(() => "?").join(", ");
        // Construct the SQL query with the correct number of placeholders
        const sql = `SELECT roomId FROM participants WHERE userId IN (${placeholders})`;
        const stmt = this.db.prepare(sql);
        // Execute the query with the userIds array spread into arguments
        stmt.bind(userIds);
        const rows: { roomId: string }[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject() as unknown as { roomId: string };
            rows.push(row);
        }
        stmt.free();
        // Map and return the roomId values as UUIDs
        return rows.map((row) => row.roomId as UUID);
    }

/**
 * Asynchronously adds a participant to a room.
 * 
 * @param {UUID} userId - The unique identifier of the user to add as a participant.
 * @param {UUID} roomId - The unique identifier of the room to add the participant to.
 * @returns {Promise<boolean>} - A promise that resolves to true if the participant was successfully added, 
 * or false if an error occurred.
 */
    async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        try {
            const sql =
                "INSERT INTO participants (id, userId, roomId) VALUES (?, ?, ?)";
            const stmt = this.db.prepare(sql);
            stmt.run([v4(), userId, roomId]);
            stmt.free();
            return true;
        } catch (error) {
            console.log("Error adding participant", error);
            return false;
        }
    }

/**
 * Removes a participant from a room.
 * 
 * @async
 * @param {UUID} userId - The ID of the user to remove.
 * @param {UUID} roomId - The ID of the room from which the user is to be removed.
 * @returns {Promise<boolean>} - A boolean indicating whether the participant was successfully removed.
 */
    async removeParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        try {
            const sql =
                "DELETE FROM participants WHERE userId = ? AND roomId = ?";
            const stmt = this.db.prepare(sql);
            stmt.run([userId, roomId]);
            stmt.free();
            return true;
        } catch (error) {
            console.log("Error removing participant", error);
            return false;
        }
    }

/**
 * Create a new relationship between two users in the database.
 * 
 * @param {Object} params - The parameters for creating the relationship.
 * @param {string} params.userA - The UUID of userA.
 * @param {string} params.userB - The UUID of userB.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the relationship was successfully created.
 * @throws {Error} - If userA or userB is missing.
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
        const stmt = this.db.prepare(sql);
        stmt.run([v4(), params.userA, params.userB, params.userA]);
        stmt.free();
        return true;
    }

/**
 * Asynchronously retrieves the relationship between two users from the database.
 *
 * @param {Object} params - The parameters for the relationship query.
 * @param {UUID} params.userA - The UUID of user A.
 * @param {UUID} params.userB - The UUID of user B.
 * @returns {Promise<Relationship | null>} A promise that resolves with the relationship if found, otherwise null.
 */
    async getRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<Relationship | null> {
        let relationship: Relationship | null = null;
        try {
            const sql =
                "SELECT * FROM relationships WHERE (userA = ? AND userB = ?) OR (userA = ? AND userB = ?)";
            const stmt = this.db.prepare(sql);
            stmt.bind([params.userA, params.userB, params.userB, params.userA]);

            if (stmt.step()) {
                relationship = stmt.getAsObject() as unknown as Relationship;
            }
            stmt.free();
        } catch (error) {
            console.log("Error fetching relationship", error);
        }
        return relationship;
    }

/**
 * Retrieves relationships for a specified user ID.
 *
 * @param {Object} params - The parameters for the query.
 * @param {UUID} params.userId - The user ID to retrieve relationships for.
 * @returns {Promise<Relationship[]>} - A promise that resolves to an array of Relationship objects.
 */
    async getRelationships(params: { userId: UUID }): Promise<Relationship[]> {
        const sql =
            "SELECT * FROM relationships WHERE (userA = ? OR userB = ?)";
        const stmt = this.db.prepare(sql);
        stmt.bind([params.userId, params.userId]);
        const relationships: Relationship[] = [];
        while (stmt.step()) {
            const relationship = stmt.getAsObject() as unknown as Relationship;
            relationships.push(relationship);
        }
        stmt.free();
        return relationships;
    }

/**
 * Retrieves the value from the cache for a given key and agent ID.
 *
 * @param {Object} params - The parameters for cache retrieval.
 * @param {string} params.key - The key to retrieve from the cache.
 * @param {UUID} params.agentId - The ID of the agent associated with the cache.
 * 
 * @returns {Promise<string | undefined>} The cached value corresponding to the key and agent ID, or undefined if not found.
 */
    async getCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<string | undefined> {
        const sql = "SELECT value FROM cache WHERE (key = ? AND agentId = ?)";
        const stmt = this.db.prepare(sql);

        stmt.bind([params.key, params.agentId]);

        let cached: { value: string } | undefined = undefined;
        if (stmt.step()) {
            cached = stmt.getAsObject() as unknown as { value: string };
        }
        stmt.free();

        return cached?.value ?? undefined;
    }

/**
 * Asynchronously sets a value in the cache.
 * 
 * @param {Object} params - The parameters for setting the cache value.
 * @param {string} params.key - The key for the cache entry.
 * @param {UUID} params.agentId - The agent ID associated with the cache entry.
 * @param {string} params.value - The value to be stored in the cache.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the cache value was successfully set.
 */ 

    async setCache(params: {
        key: string;
        agentId: UUID;
        value: string;
    }): Promise<boolean> {
        const sql =
            "INSERT OR REPLACE INTO cache (key, agentId, value, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
        const stmt = this.db.prepare(sql);

        stmt.run([params.key, params.agentId, params.value]);
        stmt.free();

        return true;
    }

/**
 * Asynchronously deletes a record from the cache table based on the provided key and agent ID.
 * 
 * @param {Object} params - The parameters for deleting a cache record.
 * @param {string} params.key - The key of the cache record to delete.
 * @param {UUID} params.agentId - The agent ID associated with the cache record.
 * @returns {Promise<boolean>} A boolean value indicating whether the cache record was successfully deleted.
 */
    async deleteCache(params: {
        key: string;
        agentId: UUID;
    }): Promise<boolean> {
        try {
            const sql = "DELETE FROM cache WHERE key = ? AND agentId = ?";
            const stmt = this.db.prepare(sql);
            stmt.run([params.key, params.agentId]);
            stmt.free();
            return true;
        } catch (error) {
            console.log("Error removing cache", error);
            return false;
        }
    }
}
