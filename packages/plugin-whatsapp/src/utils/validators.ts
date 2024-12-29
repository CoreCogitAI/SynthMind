import { WhatsAppMessage, WhatsAppTemplate, WhatsAppConfig } from "../types";

/**
 * Validates the WhatsApp configuration object.
 * @param {WhatsAppConfig} config - The configuration object containing accessToken and phoneNumberId.
 * @throws {Error} If accessToken or phoneNumberId is missing.
 */
export function validateConfig(config: WhatsAppConfig): void {
    if (!config.accessToken) {
        throw new Error("WhatsApp access token is required");
    }
    if (!config.phoneNumberId) {
        throw new Error("WhatsApp phone number ID is required");
    }
}

/**
 * Validates a WhatsApp message to ensure it meets the necessary criteria.
 * @param {WhatsAppMessage} message - The WhatsApp message to validate.
 * @throws {Error} - If recipient phone number, message type, or message content is missing.
 */
export function validateMessage(message: WhatsAppMessage): void {
    if (!message.to) {
        throw new Error("Recipient phone number is required");
    }

    if (!message.type) {
        throw new Error("Message type is required");
    }

    if (!message.content) {
        throw new Error("Message content is required");
    }

    if (message.type === "template") {
        validateTemplate(message.content as WhatsAppTemplate);
    }
}

/**
 * Validates a WhatsApp template.
 * @param {WhatsAppTemplate} template - The WhatsApp template to validate.
 * @throws {Error} If template name is not provided.
 * @throws {Error} If template language code is not provided.
 */
export function validateTemplate(template: WhatsAppTemplate): void {
    if (!template.name) {
        throw new Error("Template name is required");
    }

    if (!template.language || !template.language.code) {
        throw new Error("Template language code is required");
    }
}

/**
 * Validates a phone number based on a basic regex pattern.
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - can be enhanced based on requirements
    const phoneRegex = /^\d{1,15}$/;
    return phoneRegex.test(phoneNumber);
}
