import axios, { AxiosInstance } from "axios";
import { WhatsAppConfig, WhatsAppMessage } from "./types";

/**
 * Represents a client for interacting with the WhatsApp API.
 */
 
export class WhatsAppClient {
    private client: AxiosInstance;
    private config: WhatsAppConfig;

/**
 * Constructor for initializing a new instance of the WhatsApp API wrapper.
 * @param {WhatsAppConfig} config - The configuration object for setting up the WhatsApp API.
 */
    constructor(config: WhatsAppConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: "https://graph.facebook.com/v17.0",
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                "Content-Type": "application/json",
            },
        });
    }

/**
 * Asynchronously sends a message using WhatsApp.
 * 
 * @param {WhatsAppMessage} message - The message to be sent.
 * @returns {Promise<any>} A Promise that resolves with the response from the WhatsApp API.
 */
    async sendMessage(message: WhatsAppMessage): Promise<any> {
        const endpoint = `/${this.config.phoneNumberId}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.to,
            type: message.type,
            ...(message.type === "text"
                ? { text: { body: message.content } }
                : { template: message.content }),
        };

        return this.client.post(endpoint, payload);
    }

/**
 * Verifies a webhook token.
 * @param {string} token - The token to verify.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the token matches the configured webhookVerifyToken, false otherwise.
 */
    async verifyWebhook(token: string): Promise<boolean> {
        return token === this.config.webhookVerifyToken;
    }
}
