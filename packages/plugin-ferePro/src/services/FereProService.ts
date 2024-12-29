import WebSocket from "ws";
import { IAgentRuntime, Service } from "@elizaos/core";

/**
 * Interface representing the response from a chat service.
 * @typedef {Object} ChatResponse
 * @property {string} answer - The response answer from the chat service.
 * @property {string} chat_id - The ID of the chat session.
 * @property {Record<string, any>[]} [representation] - Additional representation data, if available.
 * @property {string} agent_api_name - The name of the agent's API.
 * @property {string} query_summary - A summary of the user query.
 * @property {number} agent_credits - The number of credits used by the agent.
 * @property {number} credits_available - The number of credits available for the agent.
 */
interface ChatResponse {
    answer: string;
    chat_id: string;
    representation?: Record<string, any>[];
    agent_api_name: string;
    query_summary: string;
    agent_credits: number;
    credits_available: number;
}

/**
* Interface representing a message with optional properties.
* @typedef {Object} FereMessage
* @property {string} message - The message content.
* @property {boolean} [stream] - Flag indicating if the message should be streamed.
* @property {boolean} [debug] - Flag indicating if the message should be shown for debugging purposes.
*/
interface FereMessage {
    message: string;
    stream?: boolean;
    debug?: boolean;
}

/**
 * Represents a response object from Fere API.
 * @typedef {Object} FereResponse
 * @property {boolean} success - Indicates if the request was successful or not.
 * @property {ChatResponse} [data] - The data returned in the response, if any.
 * @property {string} [error] - The error message, if the request was not successful.
 */
interface FereResponse {
    success: boolean;
    data?: ChatResponse;
    error?: string;
}

/**
 * FereProService class that extends Service.
 * 
 * @param {WebSocket | null} ws - WebSocket connection instance.
 * @param {string} user - User ID for FerePro service.
 * @param {IAgentRuntime | null} runtime - Runtime instance for the agent.
 * 
 * @async
 * @function initialize
 * @param {IAgentRuntime} runtime - Instance of IAgentRuntime to initialize FerePro WebSocket Service.
 * @returns {Promise<void>} Promise that resolves when initialization is complete.
 * 
 * @async
 * @function sendMessage
 * @param {FereMessage} payload - Message payload to be sent over WebSocket.
 * @returns {Promise<FereResponse>} Promise that resolves with the FereResponse from WebSocket.
 */
export class FereProService extends Service {
    private ws: WebSocket | null = null;
    private user: string = "1a5b4a29-9d95-44c8-aef3-05a8e515f43e";
    private runtime: IAgentRuntime | null = null;

/**
 * Asynchronously initializes the WebSocket service for FerePro.
 * 
 * @param {IAgentRuntime} runtime - The runtime object for the agent.
 * @returns {Promise<void>} - A Promise that resolves when initialization is complete.
 */
    async initialize(runtime: IAgentRuntime): Promise<void> {
        console.log("Initializing FerePro WebSocket Service");
        this.runtime = runtime;
        this.user = runtime.getSetting("FERE_USER_ID") ?? this.user;
    }

    /**
     * Connect to WebSocket and send a message
     */
/**
 * Sends a message via WebSocket to FereAI chat endpoint and returns the response.
 * 
 * @param {FereMessage} payload - The message payload to send.
 * @returns {Promise<FereResponse>} A promise that resolves with the response from the server.
 */
    async sendMessage(payload: FereMessage): Promise<FereResponse> {
        return new Promise((resolve, reject) => {
            try {
                const url = `wss:/api.fereai.xyz/chat/v2/ws/${this.user}`;
                this.ws = new WebSocket(url);

                this.ws.on("open", () => {
                    console.log("Connected to FerePro WebSocket");
                    this.ws?.send(JSON.stringify(payload));
                    console.log("Message sent:", payload.message);
                });

                this.ws.on("message", (data) => {
                    try {
                        const response = JSON.parse(data.toString());
                        const chatResponse: ChatResponse = {
                            answer: response.answer,
                            chat_id: response.chat_id,
                            representation: response.representation || null,
                            agent_api_name: response.agent_api_name,
                            query_summary: response.query_summary,
                            agent_credits: response.agent_credits,
                            credits_available: response.credits_available,
                        };

                        console.log("Received ChatResponse:", chatResponse);

                        resolve({
                            success: true,
                            data: chatResponse,
                        });
                    } catch (err) {
                        console.error("Error parsing response:", err);
                        reject({
                            success: false,
                            error: "Invalid response format",
                        });
                    }
                });

                this.ws.on("close", () => {
                    console.log("Disconnected from FerePro WebSocket");
                });

                this.ws.on("error", (err) => {
                    console.error("WebSocket error:", err);
                    reject({
                        success: false,
                        error: err.message,
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Error Occured",
                });
            }
        });
    }
}

export default FereProService;
