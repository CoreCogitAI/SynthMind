import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
    type Memory,
    type Goal,
    type Relationship,
    Actor,
    GoalStatus,
    Account,
    type UUID,
    Participant,
    Room,
} from "@elizaos/core";
import { DatabaseAdapter } from "@elizaos/core";
import { v4 as uuid } from "uuid";
/**
 * Class representing a database adapter for Supabase.
 */

export class SupabaseDatabaseAdapter extends DatabaseAdapter {
/**
 * Retrieves the room ID associated with the given `roomId`.
 * @param {UUID} roomId - The UUID of the room to retrieve.
 * @returns {Promise<UUID | null>} The UUID of the room if found, otherwise null.
 */
    async getRoom(roomId: UUID): Promise<UUID | null> {
        const { data, error } = await this.supabase
            .from("rooms")
            .select("id")
            .eq("id", roomId)
            .single();

        if (error) {
            throw new Error(`Error getting room: ${error.message}`);
        }

        return data ? (data.id as UUID) : null;
    }

/**
 * Retrieve participants for a specific user account.
 * 
 * @param {UUID} userId - The unique identifier of the user account to retrieve participants for.
 * @returns {Promise<Participant[]>} The array of participants associated with the user account.
 * @throws {Error} If there is an error retrieving the participants.
 */
    async getParticipantsForAccount(userId: UUID): Promise<Participant[]> {
        const { data, error } = await this.supabase
            .from("participants")
            .select("*")
            .eq("userId", userId);

        if (error) {
            throw new Error(
                `Error getting participants for account: ${error.message}`
            );
        }

        return data as Participant[];
    }

/**
 * Asynchronously retrieves the user state of a participant in a specific room.
 * @param {UUID} roomId - The ID of the room to retrieve the participant's user state from.
 * @param {UUID} userId - The ID of the user to retrieve the user state for.
 * @returns {Promise<"FOLLOWED" | "MUTED" | null>} The user state of the participant, which can be "FOLLOWED", "MUTED" or null.
 */
    async getParticipantUserState(
        roomId: UUID,
        userId: UUID
    ): Promise<"FOLLOWED" | "MUTED" | null> {
        const { data, error } = await this.supabase
            .from("participants")
            .select("userState")
            .eq("roomId", roomId)
            .eq("userId", userId)
            .single();

        if (error) {
            console.error("Error getting participant user state:", error);
            return null;
        }

        return data?.userState as "FOLLOWED" | "MUTED" | null;
    }

/**
 * Set the user state for a participant in a specific room.
 * @param {UUID} roomId - The ID of the room.
 * @param {UUID} userId - The ID of the user/participant.
 * @param {"FOLLOWED" | "MUTED" | null} state - The state to set for the user, can be "FOLLOWED", "MUTED", or null.
 * @returns {Promise<void>} - A Promise that resolves when the user state is successfully set, or rejects with an error.
 */
    async setParticipantUserState(
        roomId: UUID,
        userId: UUID,
        state: "FOLLOWED" | "MUTED" | null
    ): Promise<void> {
        const { error } = await this.supabase
            .from("participants")
            .update({ userState: state })
            .eq("roomId", roomId)
            .eq("userId", userId);

        if (error) {
            console.error("Error setting participant user state:", error);
            throw new Error("Failed to set participant user state");
        }
    }

/**
 * Asynchronously retrieves the list of participants (userIds) for a specified room from the 'participants' table in Supabase.
 * 
 * @param {UUID} roomId - The unique identifier of the room to retrieve participants for.
 * @returns {Promise<UUID[]>} An array of UUIDs representing the participants in the specified room.
 * @throws {Error} If there is an error while fetching the participants, an error will be thrown with a descriptive message.
 */
    async getParticipantsForRoom(roomId: UUID): Promise<UUID[]> {
        const { data, error } = await this.supabase
            .from("participants")
            .select("userId")
            .eq("roomId", roomId);

        if (error) {
            throw new Error(
                `Error getting participants for room: ${error.message}`
            );
        }

        return data.map((row) => row.userId as UUID);
    }

    supabase: SupabaseClient;

/**
 * Constructor for initializing a new instance of the class.
 * 
 * @param {string} supabaseUrl - The URL for the Supabase API.
 * @param {string} supabaseKey - The API key for accessing the Supabase API.
 */
    constructor(supabaseUrl: string, supabaseKey: string) {
        super();
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

/**
 * Initializes the component asynchronously.
 */
    async init() {
        // noop
    }

/**
 * Asynchronous function to close the current operation. 
 * This function performs no operation.
 */
    async close() {
        // noop
    }

/**
 * Retrieves memories by specified room IDs from a given table in Supabase.
 * 
 * @param {Object} params - The parameters for querying memories.
 * @param {UUID[]} params.roomIds - The array of room IDs to filter memories by.
 * @param {UUID} [params.agentId] - Optional agent ID to further filter memories by.
 * @param {string} params.tableName - The name of the table containing the memories.
 * @returns {Promise<Memory[]>} The memories retrieved based on the given parameters.
 */
    async getMemoriesByRoomIds(params: {
        roomIds: UUID[];
        agentId?: UUID;
        tableName: string;
    }): Promise<Memory[]> {
        let query = this.supabase
            .from(params.tableName)
            .select("*")
            .in("roomId", params.roomIds);

        if (params.agentId) {
            query = query.eq("agentId", params.agentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error retrieving memories by room IDs:", error);
            return [];
        }

        // map createdAt to Date
        const memories = data.map((memory) => ({
            ...memory,
        }));

        return memories as Memory[];
    }

/**
 * Retrieves an account by its ID from the database.
 * @param {UUID} userId - The unique identifier of the account to retrieve.
 * @returns {Promise<Account | null>} The account object if found, otherwise null.
 */
    async getAccountById(userId: UUID): Promise<Account | null> {
        const { data, error } = await this.supabase
            .from("accounts")
            .select("*")
            .eq("id", userId);
        if (error) {
            throw new Error(error.message);
        }
        return (data?.[0] as Account) || null;
    }

/**
 * Asynchronously creates a new account in the "accounts" table.
 * 
 * @param {Account} account - The account object to be inserted into the database.
 * @returns {Promise<boolean>} A promise that resolves to true if the account was successfully created, false otherwise.
 */
    async createAccount(account: Account): Promise<boolean> {
        const { error } = await this.supabase
            .from("accounts")
            .upsert([account]);
        if (error) {
            console.error(error.message);
            return false;
        }
        return true;
    }

/**
 * Retrieve details of actors in a specific room
 * @param {Object} params - The parameters for the query
 * @param {string} params.roomId - The UUID of the room to get actor details for
 * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects containing name, details, id, and username
 */
    async getActorDetails(params: { roomId: UUID }): Promise<Actor[]> {
        try {
            const response = await this.supabase
                .from("rooms")
                .select(
                    `
          participants:participants(
            account:accounts(id, name, username, details)
          )
      `
                )
                .eq("id", params.roomId);

            if (response.error) {
                console.error("Error!" + response.error);
                return [];
            }
            const { data } = response;

            return data
                .map((room) =>
                    room.participants.map((participant) => {
                        const user = participant.account as unknown as Actor;
                        return {
                            name: user?.name,
                            details: user?.details,
                            id: user?.id,
                            username: user?.username,
                        };
                    })
                )
                .flat();
        } catch (error) {
            console.error("error", error);
            throw error;
        }
    }

/**
 * Search memories in a specified table with given parameters.
 * 
 * @param {object} params - The parameters for the search operation.
 * @param {string} params.tableName - The name of the table to search in.
 * @param {UUID} params.roomId - The ID of the room to search memories in.
 * @param {number[]} params.embedding - The embedding values to search with.
 * @param {number} params.match_threshold - The threshold for matching memories.
 * @param {number} params.match_count - The count of matching memories to return.
 * @param {boolean} params.unique - Flag to indicate whether to return unique memories.
 * 
 * @returns {Promise<Memory[]>} - A promise that resolves to an array of Memory objects.
 */
    async searchMemories(params: {
        tableName: string;
        roomId: UUID;
        embedding: number[];
        match_threshold: number;
        match_count: number;
        unique: boolean;
    }): Promise<Memory[]> {
        const result = await this.supabase.rpc("search_memories", {
            query_table_name: params.tableName,
            query_roomId: params.roomId,
            query_embedding: params.embedding,
            query_match_threshold: params.match_threshold,
            query_match_count: params.match_count,
            query_unique: params.unique,
        });
        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }
        return result.data.map((memory) => ({
            ...memory,
        }));
    }

/**
 * Retrieve cached embeddings from Supabase based on the provided query parameters.
 * 
 * @param {Object} opts - The options for retrieving cached embeddings.
 * @param {string} opts.query_table_name - The name of the table containing the embeddings.
 * @param {number} opts.query_threshold - The threshold for the query.
 * @param {string} opts.query_input - The input query string.
 * @param {string} opts.query_field_name - The name of the field in the table.
 * @param {string} opts.query_field_sub_name - The sub-name of the field in the table.
 * @param {number} opts.query_match_count - The count of matches for the query.
 * @returns {Promise<{embedding: number[]; levenshtein_score: number}[]>} A promise that resolves to an array of objects containing the embedding and Levenshtein score.
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
        const result = await this.supabase.rpc("get_embedding_list", opts);
        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }
        return result.data;
    }

/**
 * Update the status of a goal in the database.
 * 
 * @param {Object} params - The parameters for updating the goal status.
 * @param {UUID} params.goalId - The ID of the goal to update.
 * @param {GoalStatus} params.status - The new status to set for the goal.
 * @returns {Promise<void>} A promise that resolves once the goal status has been updated.
 */
    async updateGoalStatus(params: {
        goalId: UUID;
        status: GoalStatus;
    }): Promise<void> {
        await this.supabase
            .from("goals")
            .update({ status: params.status })
            .match({ id: params.goalId });
    }

/**
 * Logs the specified information into the "logs" table in Supabase.
 * @param {Object} params - The parameters for logging.
 * @param {Object.<string, unknown>} params.body - The body of the log entry.
 * @param {string} params.userId - The user ID associated with the log entry.
 * @param {string} params.roomId - The room ID associated with the log entry.
 * @param {string} params.type - The type of log entry.
 * @returns {Promise<void>} - A Promise that resolves when the log is successfully inserted, or rejects on error.
 */
    async log(params: {
        body: { [key: string]: unknown };
        userId: UUID;
        roomId: UUID;
        type: string;
    }): Promise<void> {
        const { error } = await this.supabase.from("logs").insert({
            body: params.body,
            userId: params.userId,
            roomId: params.roomId,
            type: params.type,
        });

        if (error) {
            console.error("Error inserting log:", error);
            throw new Error(error.message);
        }
    }

/**
 * Retrieves memories based on the given parameters.
 * @param {Object} params - The parameters for querying memories.
 * @param {UUID} params.roomId - The UUID of the room to retrieve memories from.
 * @param {number} [params.count] - The number of memories to retrieve.
 * @param {boolean} [params.unique] - Whether to retrieve unique memories.
 * @param {string} params.tableName - The name of the table to query memories from.
 * @param {UUID} [params.agentId] - The UUID of the agent associated with the memories.
 * @param {number} [params.start] - The start date for retrieving memories.
 * @param {number} [params.end] - The end date for retrieving memories.
 * @returns {Promise<Memory[]>} The list of memories that match the query parameters.
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
        const query = this.supabase
            .from(params.tableName)
            .select("*")
            .eq("roomId", params.roomId);

        if (params.start) {
            query.gte("createdAt", params.start);
        }

        if (params.end) {
            query.lte("createdAt", params.end);
        }

        if (params.unique) {
            query.eq("unique", true);
        }

        if (params.agentId) {
            query.eq("agentId", params.agentId);
        }

        query.order("createdAt", { ascending: false });

        if (params.count) {
            query.limit(params.count);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error retrieving memories: ${error.message}`);
        }

        return data as Memory[];
    }

/**
 * Search memories based on the provided embedding vector and parameters.
 * 
 * @param {number[]} embedding - The embedding vector to search for.
 * @param {Object} params - The parameters for the search.
 * @param {number} [params.match_threshold] - The match threshold for the search.
 * @param {number} [params.count] - The maximum number of memories to return.
 * @param {UUID} [params.roomId] - The ID of the room to search memories in.
 * @param {UUID} [params.agentId] - The ID of the agent associated with the memories.
 * @param {boolean} [params.unique] - Flag indicating if only unique memories should be returned.
 * @param {string} params.tableName - The name of the table to search in.
 * @returns {Promise<Memory[]>} Returns a list of memories that match the search criteria.
 */
    async searchMemoriesByEmbedding(
        embedding: number[],
        params: {
            match_threshold?: number;
            count?: number;
            roomId?: UUID;
            agentId?: UUID;
            unique?: boolean;
            tableName: string;
        }
    ): Promise<Memory[]> {
        const queryParams = {
            query_table_name: params.tableName,
            query_roomId: params.roomId,
            query_embedding: embedding,
            query_match_threshold: params.match_threshold,
            query_match_count: params.count,
            query_unique: !!params.unique,
        };
        if (params.agentId) {
            (queryParams as any).query_agentId = params.agentId;
        }

        const result = await this.supabase.rpc("search_memories", queryParams);
        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }
        return result.data.map((memory) => ({
            ...memory,
        }));
    }

/**
 * Retrieves a memory by its ID from the database.
 * @param {UUID} memoryId - The ID of the memory to retrieve.
 * @returns {Promise<Memory | null>} - A Promise that resolves with the retrieved Memory object or null if an error occurs.
 */
    async getMemoryById(memoryId: UUID): Promise<Memory | null> {
        const { data, error } = await this.supabase
            .from("memories")
            .select("*")
            .eq("id", memoryId)
            .single();

        if (error) {
            console.error("Error retrieving memory by ID:", error);
            return null;
        }

        return data as Memory;
    }

/**
 * Creates a new memory in the provided table.
 * @param {Memory} memory - The memory object to be created.
 * @param {string} tableName - The name of the table in which the memory will be created.
 * @param {boolean} [unique=false] - Indicates whether the memory should be unique based on certain criteria.
 * @returns {Promise<void>} A Promise that resolves when the memory is successfully created.
 */
    async createMemory(
        memory: Memory,
        tableName: string,
        unique = false
    ): Promise<void> {
        const createdAt = memory.createdAt ?? Date.now();
        if (unique) {
            const opts = {
                // TODO: Add ID option, optionally
                query_table_name: tableName,
                query_userId: memory.userId,
                query_content: memory.content.text,
                query_roomId: memory.roomId,
                query_embedding: memory.embedding,
                query_createdAt: createdAt,
                similarity_threshold: 0.95,
            };

            const result = await this.supabase.rpc(
                "check_similarity_and_insert",
                opts
            );

            if (result.error) {
                throw new Error(JSON.stringify(result.error));
            }
        } else {
            const result = await this.supabase
                .from("memories")
                .insert({ ...memory, createdAt, type: tableName });
            const { error } = result;
            if (error) {
                throw new Error(JSON.stringify(error));
            }
        }
    }

/**
 * Asynchronously removes a memory from the database.
 *
 * @param {UUID} memoryId - The ID of the memory to be removed.
 * @returns {Promise<void>} - A promise that resolves once the memory is successfully removed.
 * @throws {Error} - If there is an error during the deletion process.
 */
    async removeMemory(memoryId: UUID): Promise<void> {
        const result = await this.supabase
            .from("memories")
            .delete()
            .eq("id", memoryId);
        const { error } = result;
        if (error) {
            throw new Error(JSON.stringify(error));
        }
    }

/**
 * Asynchronously removes all memories associated with a given room from the specified table in the database.
 * 
 * @param {UUID} roomId - The unique identifier of the room for which memories are to be removed.
 * @param {string} tableName - The name of the table where memories are stored.
 * @returns {Promise<void>} - A Promise that resolves when the memories have been successfully removed.
 * @throws {Error} - If there is an error during the removal process, an Error object with details of the error is thrown.
 */
    async removeAllMemories(roomId: UUID, tableName: string): Promise<void> {
        const result = await this.supabase.rpc("remove_memories", {
            query_table_name: tableName,
            query_roomId: roomId,
        });

        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }
    }

/**
 * Async function to count the number of memories associated with a room.
 * 
 * @param {UUID} roomId - The ID of the room to count memories for.
 * @param {boolean} unique - Optional parameter to specify if only unique memories should be counted. Default is true.
 * @param {string} tableName - The name of the table in which the memories are stored.
 * @returns {Promise<number>} The number of memories counted.
 * @throws {Error} If tableName is not provided or if an error occurs during the counting process.
 */
    async countMemories(
        roomId: UUID,
        unique = true,
        tableName: string
    ): Promise<number> {
        if (!tableName) {
            throw new Error("tableName is required");
        }
        const query = {
            query_table_name: tableName,
            query_roomId: roomId,
            query_unique: !!unique,
        };
        const result = await this.supabase.rpc("count_memories", query);

        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }

        return result.data;
    }

/**
 * Asynchronously retrieves goals based on the provided parameters.
 * @param {Object} params - The parameters for retrieving goals.
 * @param {string} params.roomId - The UUID of the room to fetch goals from.
 * @param {string | null | undefined} [params.userId] - The UUID of the user to filter goals by.
 * @param {boolean} [params.onlyInProgress] - Indicates if only goals in progress should be returned.
 * @param {number} [params.count] - The number of goals to retrieve.
 * @returns {Promise<Goal[]>} The goals that match the provided criteria.
 */
    async getGoals(params: {
        roomId: UUID;
        userId?: UUID | null;
        onlyInProgress?: boolean;
        count?: number;
    }): Promise<Goal[]> {
        const opts = {
            query_roomId: params.roomId,
            query_userId: params.userId,
            only_in_progress: params.onlyInProgress,
            row_count: params.count,
        };

        const { data: goals, error } = await this.supabase.rpc(
            "get_goals",
            opts
        );

        if (error) {
            throw new Error(error.message);
        }

        return goals;
    }

/**
 * Update a goal in the goals table.
 * 
 * @param {Goal} goal - The goal object to update.
 * @returns {Promise<void>} - A Promise that resolves when the goal is successfully updated.
 * @throws {Error} - If there is an error updating the goal.
 */
    async updateGoal(goal: Goal): Promise<void> {
        const { error } = await this.supabase
            .from("goals")
            .update(goal)
            .match({ id: goal.id });
        if (error) {
            throw new Error(`Error creating goal: ${error.message}`);
        }
    }

/**
 * Creates a new goal in the database.
 *
 * @param {Goal} goal - The goal to be created.
 * @returns {Promise<void>} A Promise that resolves when the goal is successfully created.
 * @throws {Error} If there is an error creating the goal.
 */
    async createGoal(goal: Goal): Promise<void> {
        const { error } = await this.supabase.from("goals").insert(goal);
        if (error) {
            throw new Error(`Error creating goal: ${error.message}`);
        }
    }

/**
 * Asynchronously removes a goal with the specified goalId from the "goals" table in the Supabase database.
 * 
 * @param {UUID} goalId - The unique identifier of the goal to be removed.
 * @returns {Promise<void>} - A Promise that resolves once the goal has been successfully removed.
 * @throws {Error} - If there is an error while removing the goal, an Error is thrown with a message indicating the error details.
 */
    async removeGoal(goalId: UUID): Promise<void> {
        const { error } = await this.supabase
            .from("goals")
            .delete()
            .eq("id", goalId);
        if (error) {
            throw new Error(`Error removing goal: ${error.message}`);
        }
    }

/**
 * Removes all goals from the database that belong to a specific room.
 * 
 * @param {UUID} roomId - The unique identifier of the room to remove goals from.
 * @returns {Promise<void>} - A Promise that resolves when the goals are successfully removed.
 * @throws {Error} - If there is an error while removing goals, an error is thrown with a message.
 */
    async removeAllGoals(roomId: UUID): Promise<void> {
        const { error } = await this.supabase
            .from("goals")
            .delete()
            .eq("roomId", roomId);
        if (error) {
            throw new Error(`Error removing goals: ${error.message}`);
        }
    }

/**
 * Retrieves the list of room IDs that a participant is a member of.
 * 
 * @param {UUID} userId - The ID of the participant
 * @returns {Promise<UUID[]>} - A promise that resolves with an array of room IDs
 * @throws {Error} - If there is an error retrieving the room IDs
 */
    async getRoomsForParticipant(userId: UUID): Promise<UUID[]> {
        const { data, error } = await this.supabase
            .from("participants")
            .select("roomId")
            .eq("userId", userId);

        if (error) {
            throw new Error(
                `Error getting rooms by participant: ${error.message}`
            );
        }

        return data.map((row) => row.roomId as UUID);
    }

/**
 * Retrieves the rooms associated with the given user IDs.
 * 
 * @param {UUID[]} userIds - An array of user IDs to search for.
 * @returns {Promise<UUID[]>} A Promise that resolves to an array of unique room IDs associated with the provided user IDs.
 * @throws {Error} If there is an error while getting rooms by participants.
 */
    async getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]> {
        const { data, error } = await this.supabase
            .from("participants")
            .select("roomId")
            .in("userId", userIds);

        if (error) {
            throw new Error(
                `Error getting rooms by participants: ${error.message}`
            );
        }

        return [...new Set(data.map((row) => row.roomId as UUID))] as UUID[];
    }

/**
 * Asynchronously creates a room with the given roomId if provided, otherwise generates a UUID as the roomId.
 * Calls the Supabase RPC method "create_room" with the provided roomId.
 * 
 * @param {UUID} [roomId] - The ID of the room to create, if not provided, a UUID will be generated.
 * @returns {Promise<UUID>} - The ID of the created room.
 * @throws {Error} - If there is an error creating the room or no data is returned from the creation process.
 */
    async createRoom(roomId?: UUID): Promise<UUID> {
        roomId = roomId ?? (uuid() as UUID);
        const { data, error } = await this.supabase.rpc("create_room", {
            roomId,
        });

        if (error) {
            throw new Error(`Error creating room: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error("No data returned from room creation");
        }

        return data[0].id as UUID;
    }

/**
 * Removes a room from the database based on the provided room ID.
 * 
 * @param {UUID} roomId - The ID of the room to be removed
 * @returns {Promise<void>} A promise that resolves once the room is successfully removed
 */
    async removeRoom(roomId: UUID): Promise<void> {
        const { error } = await this.supabase
            .from("rooms")
            .delete()
            .eq("id", roomId);

        if (error) {
            throw new Error(`Error removing room: ${error.message}`);
        }
    }

/**
 * Adds a participant to a specific room.
 * 
 * @param {UUID} userId - The ID of the user to add as a participant.
 * @param {UUID} roomId - The ID of the room to add the participant to.
 * @returns {Promise<boolean>} - A promise that resolves to true if the participant is added successfully,
 * and false if there was an error.
 */
    async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        const { error } = await this.supabase
            .from("participants")
            .insert({ userId: userId, roomId: roomId });

        if (error) {
            console.error(`Error adding participant: ${error.message}`);
            return false;
        }
        return true;
    }

/**
 * Removes a participant from a room.
 * 
 * @param {UUID} userId - The ID of the user to remove from the room.
 * @param {UUID} roomId - The ID of the room from which to remove the participant.
 * @returns {Promise<boolean>} A Promise that resolves to true if the participant was successfully removed, false otherwise.
 */
    async removeParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        const { error } = await this.supabase
            .from("participants")
            .delete()
            .eq("userId", userId)
            .eq("roomId", roomId);

        if (error) {
            console.error(`Error removing participant: ${error.message}`);
            return false;
        }
        return true;
    }

/**
 * Creates a relationship between two users by inserting records into the "rooms", "participants", and "relationships" tables in the database.
 * If an existing room is found between the users, it uses the first room's ID; otherwise, it creates a new room.
 * @param {Object} params - The parameters for creating the relationship.
 * @param {UUID} params.userA - The UUID of the first user.
 * @param {UUID} params.userB - The UUID of the second user.
 * @returns {Promise<boolean>} - A promise that resolves to true if the relationship creation is successful.
 */ 
    async createRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<boolean> {
        const allRoomData = await this.getRoomsForParticipants([
            params.userA,
            params.userB,
        ]);

        let roomId: UUID;

        if (!allRoomData || allRoomData.length === 0) {
            // If no existing room is found, create a new room
            const { data: newRoomData, error: roomsError } = await this.supabase
                .from("rooms")
                .insert({})
                .single();

            if (roomsError) {
                throw new Error("Room creation error: " + roomsError.message);
            }

            roomId = (newRoomData as Room)?.id as UUID;
        } else {
            // If an existing room is found, use the first room's ID
            roomId = allRoomData[0];
        }

        const { error: participantsError } = await this.supabase
            .from("participants")
            .insert([
                { userId: params.userA, roomId },
                { userId: params.userB, roomId },
            ]);

        if (participantsError) {
            throw new Error(
                "Participants creation error: " + participantsError.message
            );
        }

        // Create or update the relationship between the two users
        const { error: relationshipError } = await this.supabase
            .from("relationships")
            .upsert({
                userA: params.userA,
                userB: params.userB,
                userId: params.userA,
                status: "FRIENDS",
            })
            .eq("userA", params.userA)
            .eq("userB", params.userB);

        if (relationshipError) {
            throw new Error(
                "Relationship creation error: " + relationshipError.message
            );
        }

        return true;
    }

/**
 * Asynchronously retrieves the relationship between two users from the database.
 * @param {Object} params - The parameters for the relationship.
 * @param {UUID} params.userA - The UUID of user A.
 * @param {UUID} params.userB - The UUID of user B.
 * @returns {Promise<Relationship | null>} The relationship between the two users, or null if no relationship exists.
 */
    async getRelationship(params: {
        userA: UUID;
        userB: UUID;
    }): Promise<Relationship | null> {
        const { data, error } = await this.supabase.rpc("get_relationship", {
            usera: params.userA,
            userb: params.userB,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data[0];
    }

/**
* Retrieves relationships of a user based on the specified parameters.
* @param {Object} params - The parameters for filtering relationships.
* @param {UUID} params.userId - The ID of the user whose relationships to retrieve.
* @returns {Promise<Relationship[]>} - A promise that resolves with an array of Relationship objects.
*/
    async getRelationships(params: { userId: UUID }): Promise<Relationship[]> {
        const { data, error } = await this.supabase
            .from("relationships")
            .select("*")
            .or(`userA.eq.${params.userId},userB.eq.${params.userId}`)
            .eq("status", "FRIENDS");

        if (error) {
            throw new Error(error.message);
        }

        return data as Relationship[];
    }
}
