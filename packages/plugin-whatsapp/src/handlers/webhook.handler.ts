import { WhatsAppClient } from "../client";
import { WhatsAppWebhookEvent } from "../types";

/**
 * Class representing a Webhook Handler for processing WhatsApp webhook events.
 */

export class WebhookHandler {
/**
 * Constructor for initializing a new instance of the class.
 * @param {WhatsAppClient} client - The WhatsApp client to be associated with this instance.
 */
    constructor(private client: WhatsAppClient) {}

/**
 * Handles incoming WhatsApp webhook event by processing messages and status updates.
 * 
 * @param {WhatsAppWebhookEvent} event - The WhatsApp webhook event to handle
 * @returns {Promise<void>} A Promise that resolves when event handling is complete
 */
    async handle(event: WhatsAppWebhookEvent): Promise<void> {
        try {
            // Process messages
            if (event.entry?.[0]?.changes?.[0]?.value?.messages) {
                const messages = event.entry[0].changes[0].value.messages;
                for (const message of messages) {
                    await this.handleMessage(message);
                }
            }

            // Process status updates
            if (event.entry?.[0]?.changes?.[0]?.value?.statuses) {
                const statuses = event.entry[0].changes[0].value.statuses;
                for (const status of statuses) {
                    await this.handleStatus(status);
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to send WhatsApp message: ${error.message}`
                );
            }
            throw new Error("Failed to send WhatsApp message");
        }
    }

/**
 * Handles incoming messages asynchronously.
 * This method should be implemented to handle message logic, such as emitting events or triggering callbacks.
 * 
 * @param {any} message - The message to be handled
 * @returns {Promise<void>}
 */
    private async handleMessage(message: any): Promise<void> {
        // Implement message handling logic
        // This could emit events or trigger callbacks based on your framework's needs
        console.log("Received message:", message);
    }

/**
 * Handles the status update.
 * 
 * @param {any} status - The status object to be handled
 * @returns {Promise<void>} A Promise that resolves once the status update is handled
 */
    private async handleStatus(status: any): Promise<void> {
        // Implement status update handling logic
        // This could emit events or trigger callbacks based on your framework's needs
        console.log("Received status update:", status);
    }
}
