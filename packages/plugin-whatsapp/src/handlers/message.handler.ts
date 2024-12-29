import { WhatsAppClient } from "../client";
import { WhatsAppMessage } from "../types";

/**
 * Class representing a message handler that can send WhatsApp messages.
 */
       
export class MessageHandler {
/**
 * Constructor for creating a new instance of a class with a WhatsAppClient dependency.
 * 
 * @param {WhatsAppClient} client - The WhatsAppClient instance to be injected into the class.
 */
    constructor(private client: WhatsAppClient) {}

/**
 * Sends a WhatsApp message using the provided message object.
 * 
 * @param {WhatsAppMessage} message - The message object containing the details of the WhatsApp message to be sent.
 * @returns {Promise<any>} A promise that resolves with the response data from sending the message.
 * @throws {Error} If there is an error while sending the WhatsApp message, an error is thrown with a corresponding message.
 */
    async send(message: WhatsAppMessage): Promise<any> {
        try {
            const response = await this.client.sendMessage(message);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to send WhatsApp message: ${error.message}`
                );
            }
            throw new Error('Failed to send WhatsApp message');
        }
    }
}
