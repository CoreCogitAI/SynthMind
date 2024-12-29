import { Plugin } from "@elizaos/core";
import { WhatsAppClient } from "./client";
import { WhatsAppConfig, WhatsAppMessage, WhatsAppWebhookEvent } from "./types";
import { MessageHandler, WebhookHandler } from "./handlers";

/**
 * Represents a plugin for integrating WhatsApp Cloud API with an application.
 * @implements {Plugin}
 */

export class WhatsAppPlugin implements Plugin {
    private client: WhatsAppClient;
    private messageHandler: MessageHandler;
    private webhookHandler: WebhookHandler;

    name: string;
    description: string;

/**
 * Constructor for creating a new instance of the WhatsApp Cloud API Plugin.
 * @param {WhatsAppConfig} config - The configuration object for WhatsApp.
 */
    constructor(private config: WhatsAppConfig) {
        this.name = "WhatsApp Cloud API Plugin";
        this.description =
            "A plugin for integrating WhatsApp Cloud API with your application.";
        this.client = new WhatsAppClient(config);
        this.messageHandler = new MessageHandler(this.client);
        this.webhookHandler = new WebhookHandler(this.client);
    }

/**
 * Asynchronously sends a WhatsApp message using the provided message object.
 * 
 * @param {WhatsAppMessage} message - The WhatsApp message object to be sent.
 * @returns {Promise<any>} A promise that resolves with the result of sending the message.
 */
    async sendMessage(message: WhatsAppMessage): Promise<any> {
        return this.messageHandler.send(message);
    }

/**
 * Handles the WhatsApp webhook event asynchronously.
 * 
 * @param {WhatsAppWebhookEvent} event - The WhatsApp webhook event to be handled
 * @returns {Promise<void>} A Promise that resolves with no value
 */
    async handleWebhook(event: WhatsAppWebhookEvent): Promise<void> {
        return this.webhookHandler.handle(event);
    }

/**
 * Verify the webhook token against the client.
 * 
 * @param {string} token - The token to verify.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the token is verified.
 */
    async verifyWebhook(token: string): Promise<boolean> {
        return this.client.verifyWebhook(token);
    }
}

export * from "./types";
