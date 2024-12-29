import { WebClient } from "@slack/web-api";
import { Service, ServiceType } from "@elizaos/core";

/**
 * Interface representing the configuration for a Slack app.
 * @typedef {Object} SlackConfig
 * @property {string} appId - The ID of the Slack app.
 * @property {string} clientId - The client ID of the Slack app.
 * @property {string} clientSecret - The client secret of the Slack app.
 * @property {string} signingSecret - The signing secret of the Slack app.
 * @property {string} verificationToken - The verification token of the Slack app.
 * @property {string} botToken - The bot token of the Slack app.
 * @property {string} botId - The ID of the Slack bot associated with the app.
 */
export interface SlackConfig {
    appId: string;
    clientId: string;
    clientSecret: string;
    signingSecret: string;
    verificationToken: string;
    botToken: string;
    botId: string;
}

/**
 * Interface representing the context for the Slack client.
 * @property {any} client - The Slack client.
 * @property {SlackConfig} config - The configuration for the Slack client.
 */
export interface SlackClientContext {
    client: any;
    config: SlackConfig;
}

/**
 * Interface representing a Slack message.
 *
 * @property {string} text - The text content of the message.
 * @property {string} userId - The user ID of the sender.
 * @property {string} channelId - The channel ID where the message was sent.
 * @property {string} [threadTs] - Optional timestamp for threading messages.
 * @property {Array<{type: string, url: string, title: string, size: number}>} [attachments] - Optional array of message attachments.
 */
export interface SlackMessage {
    text: string;
    userId: string;
    channelId: string;
    threadTs?: string;
    attachments?: Array<{
        type: string;
        url: string;
        title: string;
        size: number;
    }>;
}

// We'll temporarily use TEXT_GENERATION as our service type
// This is not ideal but allows us to work within current constraints
export const SLACK_SERVICE_TYPE = ServiceType.TEXT_GENERATION;

// Interface extending core Service
/**
 * Interface for Slack service that extends Service
 * @interface
 * @property {WebClient} client - The web client used for communication with Slack API
 */
export interface ISlackService extends Service {
    client: WebClient;
}
