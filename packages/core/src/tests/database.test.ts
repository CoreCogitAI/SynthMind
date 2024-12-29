/* eslint-disable no-dupe-class-members */
import { DatabaseAdapter } from "../database.ts"; // Adjust the import based on your project structure
import {
    Memory,
    Actor,
    Account,
    Goal,
    GoalStatus,
    Participant,
    Relationship,
    UUID,
} from "../types"; // Adjust based on your types location

/**
 * A mock database adapter class that extends DatabaseAdapter and provides mock implementations for various database operations.
 * 
 * @class MockDatabaseAdapter
 * @extends DatabaseAdapter
 */
class MockDatabaseAdapter extends DatabaseAdapter {
/**
 * Retrieves a memory by its unique identifier.
 *
 * @param {UUID} _id - The unique identifier of the memory to retrieve.
 * @returns {Promise<Memory | null>} A promise that resolves with the memory object, or null if the memory is not found.
 */
    getMemoryById(_id: UUID): Promise<Memory | null> {
        throw new Error("Method not implemented.");
    }
/**
 * Logs the specified parameters for a user in a specific room.
 * @param {Object} _params - The parameters for the log method.
 * @param {Object} _params.body - The body containing key-value pairs of unknown data.
 * @param {string} _params.userId - The UUID of the user.
 * @param {string} _params.roomId - The UUID of the room.
 * @param {string} _params.type - The type of log entry.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
    log(_params: {
        body: { [key: string]: unknown };
        userId: UUID;
        roomId: UUID;
        type: string;
    }): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieves details for a specific actor in a room.
 * @param {Object} _params - The parameters for retrieving actor details.
 * @param {string} _params.roomId - The ID of the room where the actor is located.
 * @returns {Promise<Actor[]>} - A promise that resolves with an array of Actor objects containing the details of the actor.
 * @throws {Error} - If the method is not implemented.
 */
    getActorDetails(_params: { roomId: UUID }): Promise<Actor[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Searches for memories based on a given embedding.
 *
 * @param {number[]} _embedding - The embedding to search memories by.
 * @param {object} _params - Parameters for the search query.
 * @param {number} [_params.match_threshold] - The threshold for matching embeddings.
 * @param {number} [_params.count] - The maximum number of memories to return.
 * @param {UUID} [_params.roomId] - The room ID to filter memories by.
 * @param {UUID} [_params.agentId] - The agent ID to filter memories by.
 * @param {boolean} [_params.unique] - Flag to return only unique memories.
 * @param {string} _params.tableName - The name of the table to search in.
 * @returns {Promise<Memory[]>} - A promise that resolves to an array of Memory objects.
 */
    searchMemoriesByEmbedding(
        _embedding: number[],
        _params: {
            match_threshold?: number;
            count?: number;
            roomId?: UUID;
            agentId?: UUID;
            unique?: boolean;
            tableName: string;
        }
    ): Promise<Memory[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Creates a memory with the specified table name and uniqueness constraint.
 * 
 * @param {Memory} _memory - The memory object to create.
 * @param {string} _tableName - The name of the table to create.
 * @param {boolean} [_unique] - Optional parameter to indicate if the table should have a unique constraint.
 * @returns {Promise<void>} A Promise that resolves when the memory is successfully created.
 */
    createMemory(
        _memory: Memory,
        _tableName: string,
        _unique?: boolean
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Remove a specific memory entry from a given table by the memory ID.
 * 
 * @param {UUID} _memoryId - The ID of the memory entry to be removed.
 * @param {string} _tableName - The name of the table from which to remove the memory entry.
 * @returns {Promise<void>} - A promise that resolves when the memory entry is successfully removed.
 */
    removeMemory(_memoryId: UUID, _tableName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Removes all memories associated with a specific room and table.
 * 
 * @param {_roomId: UUID} _roomId - The ID of the room from which memories will be removed.
 * @param {_tableName: string} _tableName - The name of the table from which memories will be removed.
 * @returns {Promise<void>} - A promise that resolves after all memories have been removed.
 */
    removeAllMemories(_roomId: UUID, _tableName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Count memories for a specific room.
 * 
 * @param {_roomId: UUID} _roomId - The ID of the room to count memories for.
 * @param {_unique?: boolean} _unique - Flag indicating if only unique memories should be counted.
 * @param {_tableName?: string} _tableName - Optional table name to count memories from.
 * @returns {Promise<number>} - A promise that resolves to the number of memories counted.
 */
```
    countMemories(
        _roomId: UUID,
        _unique?: boolean,
        _tableName?: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieve goals based on specified parameters.
 * 
 * @param {object} _params - The parameters object.
 * @param {UUID} _params.roomId - The ID of the room where the goals are located.
 * @param {UUID} [_params.userId] - Optional: The ID of the user to filter goals by.
 * @param {boolean} [_params.onlyInProgress] - Optional: Whether to only retrieve goals that are in progress.
 * @param {number} [_params.count] - Optional: The maximum number of goals to retrieve.
 * @returns {Promise<Goal[]>} - A Promise that resolves to an array of Goal objects.
 */
    getGoals(_params: {
        roomId: UUID;
        userId?: UUID | null;
        onlyInProgress?: boolean;
        count?: number;
    }): Promise<Goal[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Update a goal in the database.
 * 
 * @param {Goal} _goal - The goal object to be updated.
 * @returns {Promise<void>}
 */
    updateGoal(_goal: Goal): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Creates a new goal.
 * 
 * @param _goal The goal to be created.
 * @returns A Promise that resolves when the goal is created.
 */
    createGoal(_goal: Goal): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Remove a goal from the list of goals based on its unique identifier.
 * 
 * @param {UUID} _goalId - The unique identifier of the goal to be removed.
 * @returns {Promise<void>} A Promise that resolves when the goal is successfully removed.
 */
    removeGoal(_goalId: UUID): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Remove all goals associated with a specific room.
 * 
 * @param {UUID} _roomId - The ID of the room for which goals need to be removed.
 * @returns {Promise<void>} A Promise that resolves when all goals are successfully removed.
 */
    removeAllGoals(_roomId: UUID): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieve a room by its ID
 * @param {UUID} _roomId - The ID of the room to retrieve
 * @returns {Promise<UUID | null>} - A promise that resolves with the UUID of the room, or null if not found
 */
    getRoom(_roomId: UUID): Promise<UUID | null> {
        throw new Error("Method not implemented.");
    }
/**
 * Creates a new room with the given room ID.
 * 
 * @param {_roomId} Optional parameter for the room ID (default is null)
 * @returns {Promise<UUID>} A promise that resolves with the UUID of the created room
 * @throws {Error} If the method is not implemented
 */
    createRoom(_roomId?: UUID): Promise<UUID> {
        throw new Error("Method not implemented.");
    }
/**
 * Removes a room with the given room ID.
 * 
 * @param {UUID} _roomId - The ID of the room to be removed.
 * @returns {Promise<void>} - A Promise that resolves once the room is removed.
 */
    removeRoom(_roomId: UUID): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieves the list of rooms for a specific participant.
 * 
 * @param {_userId} UUID - The unique identifier of the participant.
 * @returns {Promise<UUID[]>} - A promise that resolves with an array of room UUIDs.
 */
    getRoomsForParticipant(_userId: UUID): Promise<UUID[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Gets the rooms available for the given participants.
 * 
 * @param {UUID[]} _userIds - The array of user IDs for which to retrieve rooms.
 * @returns {Promise<UUID[]>} - A promise that resolves to an array of room IDs.
 * @throws {Error} - Indicates that the method is not implemented.
 */
    getRoomsForParticipants(_userIds: UUID[]): Promise<UUID[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Adds a user to a room as a participant.
 * 
 * @param {UUID} _userId - The ID of the user to add to the room.
 * @param {UUID} _roomId - The ID of the room where the user will be added.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user was successfully added to the room, otherwise false.
 */
    addParticipant(_userId: UUID, _roomId: UUID): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
/**
 * Remove a participant from a room.
 * 
 * @param {_userId} UUID - The ID of the user to be removed.
 * @param {_roomId} UUID - The ID of the room from which the user should be removed.
 * @returns Promise<boolean> - A promise that resolves to true if the participant was successfully removed, false otherwise.
 */
    removeParticipant(_userId: UUID, _roomId: UUID): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieve a list of participants associated with a specific user account.
 * 
 * @param {UUID} userId - The unique identifier of the user account.
 * @returns {Promise<Participant[]>} A promise that resolves to an array of Participant objects.
 */
    getParticipantsForAccount(userId: UUID): Promise<Participant[]>;
/**
 * Retrieves the list of participants associated with a specific user account.
 * 
 * @param {UUID} userId - The unique identifier of the user account to retrieve participants for.
 * @returns {Promise<Participant[]>} A Promise that resolves to an array of Participant objects representing the participants associated with the user account.
 */
    getParticipantsForAccount(userId: UUID): Promise<Participant[]>;
/**
 * Get the list of participants associated with a given user account.
 * 
 * @param {unknown} _userId - The unique identifier of the user account
 * @returns {Promise<import("../types").Participant[]>} - A Promise that resolves to an array of participants
 */
    getParticipantsForAccount(
        _userId: unknown
    ): Promise<import("../types").Participant[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieves the list of participants for a specific room based on the room ID.
 * 
 * @param {UUID} _roomId - The unique identifier of the room to retrieve participants for.
 * @returns {Promise<UUID[]>} - A Promise that resolves to an array of UUIDs representing the participants in the room.
 */
    getParticipantsForRoom(_roomId: UUID): Promise<UUID[]> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieve the state of a participant user in a specified room.
 * 
 * @param {UUID} _roomId - The unique identifier of the room.
 * @param {UUID} _userId - The unique identifier of the user/participant.
 * @returns {Promise<"FOLLOWED" | "MUTED" | null>} - The state of the participant user, which can be "FOLLOWED", "MUTED", or null if not found.
 */
    getParticipantUserState(
        _roomId: UUID,
        _userId: UUID
    ): Promise<"FOLLOWED" | "MUTED" | null> {
        throw new Error("Method not implemented.");
    }
/**
 * Set the user state for a participant in a specific room.
 * @param {UUID} _roomId - The unique identifier of the room.
 * @param {UUID} _userId - The unique identifier of the user.
 * @param {"FOLLOWED" | "MUTED" | null} _state - The state to set for the user (FOLLOWED, MUTED, or null).
 * @returns {Promise<void>} - A Promise that resolves once the user state is set.
 */
    setParticipantUserState(
        _roomId: UUID,
        _userId: UUID,
        _state: "FOLLOWED" | "MUTED" | null
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }
/**
 * Creates a relationship between two users.
 * 
 * @param {object} _params - The parameters for creating the relationship.
 * @param {string} _params.userA - The UUID of the first user.
 * @param {string} _params.userB - The UUID of the second user.
 * 
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean value indicating if the relationship was successfully created.
 */
    createRelationship(_params: {
        userA: UUID;
        userB: UUID;
    }): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieves the relationship between two users.
 * 
 * @param {Object} _params - The parameters for the relationship query.
 * @param {UUID} _params.userA - The UUID for userA.
 * @param {UUID} _params.userB - The UUID for userB.
 * @returns {Promise<Relationship | null>} - A promise that resolves with the relationship object, or null if there is no relationship.
 */
    getRelationship(_params: {
        userA: UUID;
        userB: UUID;
    }): Promise<Relationship | null> {
        throw new Error("Method not implemented.");
    }
/**
 * Retrieves relationships for a specific user.
 * 
 * @param {object} _params - The parameters for the query.
 * @param {string} _params.userId - The ID of the user to get relationships for.
 * @returns {Promise<Relationship[]>} A Promise that resolves with an array of Relationship objects.
 */
    getRelationships(_params: { userId: UUID }): Promise<Relationship[]> {
        throw new Error("Method not implemented.");
    }
    db: any = {};

    // Mock method for getting memories by room IDs
/**
 * Asynchronously retrieves memories by room IDs.
 * @param {Object} params - The parameters for retrieving memories.
 * @param {string[]} params.roomIds - An array of room IDs.
 * @param {string} [params.agentId] - The optional agent ID.
 * @param {string} params.tableName - The name of the table.
 * @returns {Promise<Memory[]>} The memories that match the provided room IDs.
 */
    async getMemoriesByRoomIds(params: {
        roomIds: `${string}-${string}-${string}-${string}-${string}`[];
        agentId?: `${string}-${string}-${string}-${string}-${string}`;
        tableName: string;
    }): Promise<Memory[]> {
        return [
            {
                id: "memory-id" as UUID,
                content: "Test Memory",
                roomId: params.roomIds[0],
                userId: "user-id" as UUID,
                agentId: params.agentId ?? ("agent-id" as UUID),
            },
        ] as unknown as Memory[];
    }

    // Mock method for getting cached embeddings
/**
 * Retrieves cached embeddings based on specified parameters.
 * @param {Object} _params - The parameters for retrieving cached embeddings.
 * @param {string} _params.query_table_name - The name of the table to query.
 * @param {number} _params.query_threshold - The threshold for the query.
 * @param {string} _params.query_input - The input for the query.
 * @param {string} _params.query_field_name - The name of the field to query.
 * @param {string} _params.query_field_sub_name - The sub name of the field to query.
 * @param {number} _params.query_match_count - The count of matches in the query.
 * @returns {Promise<any[]>} An array containing the retrieved embeddings and associated data.
 */
    async getCachedEmbeddings(_params: {
        query_table_name: string;
        query_threshold: number;
        query_input: string;
        query_field_name: string;
        query_field_sub_name: string;
        query_match_count: number;
    }): Promise<any[]> {
        return [
            {
                embedding: [0.1, 0.2, 0.3],
                levenshtein_distance: 0.4,
            },
        ];
    }

    // Mock method for searching memories
/**
 * Asynchronously search for memories based on the provided parameters.
 * 
 * @param {object} params - The search parameters
 * @param {string} params.tableName - The name of the table to search in
 * @param {string} params.roomId - The room ID to search memories in
 * @param {number[]} params.embedding - The embedding to match memories against
 * @param {number} params.match_threshold - The threshold for a match
 * @param {number} params.match_count - The number of matches to retrieve
 * @param {boolean} params.unique - Flag indicating if memories should be unique
 * @returns {Promise<Memory[]>} - A promise that resolves to an array of memories matching the search criteria
 */
    async searchMemories(params: {
        tableName: string;
        roomId: `${string}-${string}-${string}-${string}-${string}`;
        embedding: number[];
        match_threshold: number;
        match_count: number;
        unique: boolean;
    }): Promise<Memory[]> {
        return [
            {
                id: "memory-id" as UUID,
                content: "Test Memory",
                roomId: params.roomId,
                userId: "user-id" as UUID,
                agentId: "agent-id" as UUID,
            },
        ] as unknown as Memory[];
    }

    // Mock method for getting account by ID
/**
 * Retrieves an account by the specified user ID.
 *
 * @param {UUID} userId - The unique identifier of the user to retrieve the account for.
 * @returns {Promise<Account | null>} The account object associated with the user ID, or null if not found.
 */
    async getAccountById(userId: UUID): Promise<Account | null> {
        return {
            id: userId,
            username: "testuser",
            name: "Test Account",
        } as Account;
    }

    // Other methods stay the same...
/**
 * Create a new account.
 * 
 * @param {Account} _account - The account to be created.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the account was successfully created.
 */
    async createAccount(_account: Account): Promise<boolean> {
        return true;
    }

/**
 * Fetches memories based on the specified parameters.
 * @param {Object} params - The parameters for filtering memories.
 * @param {UUID} params.roomId - The ID of the room to fetch memories for.
 * @param {number} [params.count] - The number of memories to fetch (optional).
 * @param {boolean} [params.unique] - Flag to indicate if only unique memories should be fetched (optional).
 * @param {string} params.tableName - The name of the table to fetch memories from.
 * @returns {Promise<Memory[]>} - The memories that match the specified criteria.
 */
    async getMemories(params: {
        roomId: UUID;
        count?: number;
        unique?: boolean;
        tableName: string;
    }): Promise<Memory[]> {
        return [
            {
                id: "memory-id" as UUID,
                content: "Test Memory",
                roomId: params.roomId,
                userId: "user-id" as UUID,
                agentId: "agent-id" as UUID,
            },
        ] as unknown as Memory[];
    }

/**
 * Asynchronous function to get actors based on specified parameters
 * @param {Object} _params - The parameters for filtering actors
 * @param {UUID} _params.roomId - The room ID to filter actors by
 * @returns {Promise<Actor[]>} - A promise that resolves to an array of Actor objects
 */
    async getActors(_params: { roomId: UUID }): Promise<Actor[]> {
        return [
            {
                id: "actor-id" as UUID,
                name: "Test Actor",
                username: "testactor",
                roomId: "room-id" as UUID, // Ensure roomId is provided
            },
        ] as unknown as Actor[];
    }

/**
 * Updates the status of a goal.
 * 
 * @param {Object} _params - The parameters for updating the goal status.
 * @param {UUID} _params.goalId - The ID of the goal to update.
 * @param {GoalStatus} _params.status - The new status for the goal.
 * @returns {Promise<void>} A promise that resolves with no value when the status is updated successfully.
 */
    async updateGoalStatus(_params: {
        goalId: UUID;
        status: GoalStatus;
    }): Promise<void> {
        return Promise.resolve();
    }

/**
 * Retrieve a goal by its ID.
 * 
 * @param {UUID} goalId - The ID of the goal to retrieve.
 * @returns {Promise<Goal|null>} - The goal object if found, or null if not found.
 */
    async getGoalById(goalId: UUID): Promise<Goal | null> {
        return {
            id: goalId,
            status: GoalStatus.IN_PROGRESS,
            roomId: "room-id" as UUID,
            userId: "user-id" as UUID,
            name: "Test Goal",
            objectives: [],
        } as Goal;
    }
}

// Now, let’s fix the test suite.

describe("DatabaseAdapter Tests", () => {
    let adapter: MockDatabaseAdapter;
    const roomId = "room-id" as UUID;

    beforeEach(() => {
        adapter = new MockDatabaseAdapter();
    });

    it("should return memories by room ID", async () => {
        const memories = await adapter.getMemoriesByRoomIds({
            roomIds: [
                "room-id" as `${string}-${string}-${string}-${string}-${string}`,
            ],
            tableName: "test_table",
        });
        expect(memories).toHaveLength(1);
        expect(memories[0].roomId).toBe("room-id");
    });

    it("should return cached embeddings", async () => {
        const embeddings = await adapter.getCachedEmbeddings({
            query_table_name: "test_table",
            query_threshold: 0.5,
            query_input: "test query",
            query_field_name: "field",
            query_field_sub_name: "subfield",
            query_match_count: 5,
        });
        expect(embeddings).toHaveLength(1);
        expect(embeddings[0].embedding).toEqual([0.1, 0.2, 0.3]);
    });

    it("should search memories based on embedding", async () => {
        const memories = await adapter.searchMemories({
            tableName: "test_table",
            roomId: "room-id" as `${string}-${string}-${string}-${string}-${string}`,
            embedding: [0.1, 0.2, 0.3],
            match_threshold: 0.5,
            match_count: 3,
            unique: true,
        });
        expect(memories).toHaveLength(1);
        expect(memories[0].roomId).toBe("room-id");
    });

    it("should get an account by user ID", async () => {
        const account = await adapter.getAccountById("test-user-id" as UUID);
        expect(account).not.toBeNull();
        expect(account.username).toBe("testuser");
    });

    it("should create a new account", async () => {
        const newAccount: Account = {
            id: "new-user-id" as UUID,
            username: "newuser",
            name: "New Account",
        };
        const result = await adapter.createAccount(newAccount);
        expect(result).toBe(true);
    });

    it("should update the goal status", async () => {
        const goalId = "goal-id" as UUID;
        await expect(
            adapter.updateGoalStatus({ goalId, status: GoalStatus.IN_PROGRESS })
        ).resolves.toBeUndefined();
    });

    it("should return actors by room ID", async () => {
        const actors = await adapter.getActors({ roomId });
        expect(actors).toHaveLength(1);
    });

    it("should get a goal by ID", async () => {
        const goalId = "goal-id" as UUID;
        const goal = await adapter.getGoalById(goalId);
        expect(goal).not.toBeNull();
        expect(goal?.status).toBe(GoalStatus.IN_PROGRESS);
    });
});
