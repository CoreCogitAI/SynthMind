import { elizaLogger, IAgentRuntime } from "@elizaos/core";
import {
    ChatMessage,
    ChatRoom,
    EchoChamberConfig,
    ModelInfo,
    ListRoomsResponse,
    RoomHistoryResponse,
    MessageResponse,
} from "./types";

const MAX_RETRIES = 3;

const RETRY_DELAY = 5000;

/**
 * Represents a client for interacting with the Echo Chamber API.
export class EchoChamberClient {
    private runtime: IAgentRuntime;
    private config: EchoChamberConfig;
    private apiUrl: string;
    private modelInfo: ModelInfo;
    private pollInterval: NodeJS.Timeout | null = null;
    private watchedRoom: string | null = null;

/**
 * Constructor for the EchoChamber class.
 * 
 * @param {IAgentRuntime} runtime - The agent runtime environment.
 * @param {EchoChamberConfig} config - The configuration for the EchoChamber.
 */
    constructor(runtime: IAgentRuntime, config: EchoChamberConfig) {
        this.runtime = runtime;
        this.config = config;
        this.apiUrl = `${config.apiUrl}/api/rooms`;
        this.modelInfo = {
            username: config.username || `agent-${runtime.agentId}`,
            model: config.model || runtime.modelProvider,
        };
    }

/**
 * Gets the username from the model information.
 * 
 * @returns {string} The username.
 */
    public getUsername(): string {
        return this.modelInfo.username;
    }

/**
 * Retrieve the model info by returning a deep copy of the current model information.
 * 
 * @returns {ModelInfo} The model information.
 */
    public getModelInfo(): ModelInfo {
        return { ...this.modelInfo };
    }

/**
 * Get the current configuration of the EchoChamber instance.
 * @returns {EchoChamberConfig} The configuration object.
 */
    public getConfig(): EchoChamberConfig {
        return { ...this.config };
    }

/**
 * Returns the authorization headers required for API requests.
 * @returns An object containing the authorization headers with key-value pairs.
 */
    private getAuthHeaders(): { [key: string]: string } {
        return {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
        };
    }

/**
 * Set the room to be watched by the user
 * 
 * @param {string} roomId - The ID of the room to be watched
 * @returns {Promise<void>} - A Promise that resolves once the watched room is set, or rejects if an error occurs
 */
    public async setWatchedRoom(roomId: string): Promise<void> {
        try {
            // Verify room exists
            const rooms = await this.listRooms();
            const room = rooms.find((r) => r.id === roomId);

            if (!room) {
                throw new Error(`Room ${roomId} not found`);
            }

            // Set new watched room
            this.watchedRoom = roomId;

            elizaLogger.success(`Now watching room: ${room.name}`);
        } catch (error) {
            elizaLogger.error("Error setting watched room:", error);
            throw error;
        }
    }

/**
 * Retrieves the room that is currently being watched.
 * 
 * @returns {string | null} The room that is being watched, or null if no room is being watched.
 */
    public getWatchedRoom(): string | null {
        return this.watchedRoom;
    }

/**
 * Retries the provided asynchronous operation for a specified number of times.
 * @template T
 * @param {() => Promise<T>} operation - The asynchronous operation to retry.
 * @param {number} [retries=MAX_RETRIES] - The maximum number of retries allowed.
 * @returns {Promise<T>} - A promise that resolves with the result of the operation.
 * @throws {Error} - Throws an error if the maximum number of retries is exceeded.
 */
    private async retryOperation<T>(
        operation: () => Promise<T>,
        retries: number = MAX_RETRIES
    ): Promise<T> {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === retries - 1) throw error;
                const delay = RETRY_DELAY * Math.pow(2, i);
                elizaLogger.warn(`Retrying operation in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error("Max retries exceeded");
    }

/**
 * Asynchronous method to start the EchoChamber client.
 * Logs the start of the client, verifies connection by listing rooms,
 * and sets the watched room to the default room if specified.
 * 
 * @returns {Promise<void>} A promise that resolves when the client is started.
 */
    public async start(): Promise<void> {
        elizaLogger.log("🚀 Starting EchoChamber client...");
        try {
            // Verify connection by listing rooms
            await this.retryOperation(() => this.listRooms());
            elizaLogger.success(
                `✅ EchoChamber client successfully started for ${this.modelInfo.username}`
            );

            // Join default room if specified and no specific room is being watched
            if (this.config.defaultRoom && !this.watchedRoom) {
                await this.setWatchedRoom(this.config.defaultRoom);
            }
        } catch (error) {
            elizaLogger.error("❌ Failed to start EchoChamber client:", error);
            throw error;
        }
    }

/**
 * Stops the EchoChamber client by clearing the poll interval, leaving the watched room if any, and logging the action.
 * @returns {Promise<void>} A Promise that resolves when the client has been stopped.
 */
    public async stop(): Promise<void> {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        // Leave watched room if any
        if (this.watchedRoom) {
            try {
                this.watchedRoom = null;
            } catch (error) {
                elizaLogger.error(
                    `Error leaving room ${this.watchedRoom}:`,
                    error
                );
            }
        }

        elizaLogger.log("Stopping EchoChamber client...");
    }

/**
 * Fetches a list of chat rooms based on optional tags.
 * 
 * @param {string[]} [tags] - Optional array of tags to filter the list of chat rooms.
 * @returns {Promise<ChatRoom[]>} - A promise that resolves to an array of ChatRoom objects.
 * @throws {Error} - If the request fails or encounters an error.
 */
    public async listRooms(tags?: string[]): Promise<ChatRoom[]> {
        try {
            const url = new URL(this.apiUrl);
            if (tags?.length) {
                url.searchParams.append("tags", tags.join(","));
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`Failed to list rooms: ${response.statusText}`);
            }

            const data = (await response.json()) as ListRoomsResponse;
            return data.rooms;
        } catch (error) {
            elizaLogger.error("Error listing rooms:", error);
            throw error;
        }
    }

/**
 * Retrieves the chat history of a specific room.
 * 
 * @param {string} roomId - The ID of the room to retrieve the history for.
 * @returns {Promise<ChatMessage[]>} - A promise that resolves with an array of chat messages.
 */
    public async getRoomHistory(roomId: string): Promise<ChatMessage[]> {
        return this.retryOperation(async () => {
            const response = await fetch(`${this.apiUrl}/${roomId}/history`);
            if (!response.ok) {
                throw new Error(
                    `Failed to get room history: ${response.statusText}`
                );
            }

            const data = (await response.json()) as RoomHistoryResponse;
            return data.messages;
        });
    }

/**
 * Sends a message to a specific chat room.
 * @param {string} roomId - The ID of the room to send the message to.
 * @param {string} content - The content of the message to send.
 * @returns {Promise<ChatMessage>} A promise that resolves to the sent chat message.
 */
    public async sendMessage(
        roomId: string,
        content: string
    ): Promise<ChatMessage> {
        return this.retryOperation(async () => {
            const response = await fetch(`${this.apiUrl}/${roomId}/message`, {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    content,
                    sender: this.modelInfo,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to send message: ${response.statusText}`
                );
            }

            const data = (await response.json()) as MessageResponse;
            return data.message;
        });
    }
}
