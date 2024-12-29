/**
 * Interface representing information about a model/agent.
 * @typedef {Object} ModelInfo
 * @property {string} username - Unique username for the model/agent
 * @property {string} model - Type/name of the model being used
 */
export interface ModelInfo {
    username: string; // Unique username for the model/agent
    model: string; // Type/name of the model being used
}

/**
 * Interface representing a chat message
 *
 * @property {string} id - Unique message identifier
 * @property {string} content - Message content/text
 * @property {ModelInfo} sender - Information about who sent the message
 * @property {string} timestamp - ISO timestamp of when message was sent
 * @property {string} roomId - ID of the room this message belongs to
 */
export interface ChatMessage {
    id: string; // Unique message identifier
    content: string; // Message content/text
    sender: ModelInfo; // Information about who sent the message
    timestamp: string; // ISO timestamp of when message was sent
    roomId: string; // ID of the room this message belongs to
}

/**
 * Represents a chat room.
 *
 * @interface ChatRoom
 * @property {string} id - Unique room identifier
 * @property {string} name - Display name of the room
 * @property {string} topic - Room's current topic/description
 * @property {string[]} tags - Tags associated with the room for categorization
 * @property {ModelInfo[]} participants - List of current room participants
 * @property {string} createdAt - ISO timestamp of room creation
 * @property {number} messageCount - Total number of messages in the room
 */
export interface ChatRoom {
    id: string; // Unique room identifier
    name: string; // Display name of the room
    topic: string; // Room's current topic/description
    tags: string[]; // Tags associated with the room for categorization
    participants: ModelInfo[]; // List of current room participants
    createdAt: string; // ISO timestamp of room creation
    messageCount: number; // Total number of messages in the room
}

/**
 * Interface for the configuration options of the EchoChamber component.
 * @property {string} apiUrl - Base URL for the EchoChambers API
 * @property {string} apiKey - Required API key for authenticated endpoints
 * @property {string} [defaultRoom] - Optional default room to join on startup
 * @property {string} [username] - Optional custom username (defaults to agent-{agentId})
 * @property {string} [model] - Optional model name (defaults to runtime.modelProvider)
 */
export interface EchoChamberConfig {
    apiUrl: string; // Base URL for the EchoChambers API
    apiKey: string; // Required API key for authenticated endpoints
    defaultRoom?: string; // Optional default room to join on startup
    username?: string; // Optional custom username (defaults to agent-{agentId})
    model?: string; // Optional model name (defaults to runtime.modelProvider)
}

/**
 * Represents the response when listing chat rooms.
 * @typedef {Object} ListRoomsResponse
 * @property {ChatRoom[]} rooms - An array of ChatRoom objects representing the available rooms.
 */
export interface ListRoomsResponse {
    rooms: ChatRoom[];
}

/**
 * Interface representing the response for retrieving the chat history of a room.
 * @property {ChatMessage[]} messages - An array of chat messages in the room.
 */
export interface RoomHistoryResponse {
    messages: ChatMessage[];
}

/**
 * Interface representing a response object containing a message.
 * @interface
 */
           
export interface MessageResponse {
    message: ChatMessage;
}

/**
 * Interface for the response when creating a chat room.
 * 
 * @property {ChatRoom} room - The created chat room.
 */
export interface CreateRoomResponse {
    room: ChatRoom;
}

/**
 * Interface for the response when clearing messages.
 * @typedef {object} ClearMessagesResponse
 * @property {boolean} success - Indicates if the operation was successful.
 * @property {string} message - The message returned after clearing the messages.
 */
export interface ClearMessagesResponse {
    success: boolean;
    message: string;
}

/**
 * Enum representing different events that can occur in a chat room.
 * @enum {string}
 * @readonly
 */
 */
export enum RoomEvent {
    MESSAGE_CREATED = "message_created",
    ROOM_CREATED = "room_created",
    ROOM_UPDATED = "room_updated",
    ROOM_JOINED = "room_joined",
    ROOM_LEFT = "room_left",
}

/**
 * Interface for a message transformer that can transform incoming and optionally outgoing messages.
 * @interface
 */

export interface MessageTransformer {
    transformIncoming(content: string): Promise<string>;
    transformOutgoing?(content: string): Promise<string>;
}

/**
 * Interface for a ContentModerator that validates content.
 * @interface
 */
- */
export interface ContentModerator {
    validateContent(content: string): Promise<boolean>;
}
