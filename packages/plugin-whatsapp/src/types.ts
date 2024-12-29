/**
 * Interface for defining configuration options for WhatsApp integration.
 * @property {string} accessToken - The access token for the WhatsApp integration.
 * @property {string} phoneNumberId - The phone number ID associated with the WhatsApp integration.
 * @property {string} [webhookVerifyToken] - Optional verify token for webhook authentication.
 * @property {string} [businessAccountId] - Optional business account ID for additional configuration.
 */
export interface WhatsAppConfig {
    accessToken: string;
    phoneNumberId: string;
    webhookVerifyToken?: string;
    businessAccountId?: string;
}

/**
 * Interface representing a WhatsApp message.
 * @typedef {object} WhatsAppMessage
 * @property {"text" | "template"} type - The type of the message.
 * @property {string} to - The recipient of the message.
 * @property {string | WhatsAppTemplate} content - The content of the message, can be a string or a WhatsAppTemplate.
 */
export interface WhatsAppMessage {
    type: "text" | "template";
    to: string;
    content: string | WhatsAppTemplate;
}

/**
 * Represents a WhatsApp template.
 * @typedef {Object} WhatsAppTemplate
 * @property {string} name - The name of the template.
 * @property {Object} language - The language object containing a 'code' property.
 * @property {Array<Object>} [components] - An optional array of components, each containing a 'type' property and an array of 'parameters'.
 * @property {string} components.type - The type of the component.
 * @property {Array<Object>} components.parameters - An array of parameters for the component, each containing a 'type' property and an optional 'text' property.
 * @property {string} components.parameters.type - The type of the parameter.
 * @property {string} [components.parameters.text] - The text value of the parameter (optional).
 */
export interface WhatsAppTemplate {
    name: string;
    language: {
        code: string;
    };
    components?: Array<{
        type: string;
        parameters: Array<{
            type: string;
            text?: string;
        }>;
    }>;
}

/**
 * Interface representing a WhatsApp Webhook Event.
 * @interface
 * @property {string} object - The type of object being sent.
 * @property {Array} entry - An array of event entries, each containing ID and changes.
 */
export interface WhatsAppWebhookEvent {
    object: string;
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                statuses?: Array<{
                    id: string;
                    status: string;
                    timestamp: string;
                    recipient_id: string;
                }>;
                messages?: Array<{
                    from: string;
                    id: string;
                    timestamp: string;
                    text?: {
                        body: string;
                    };
                    type: string;
                }>;
            };
            field: string;
        }>;
    }>;
}
