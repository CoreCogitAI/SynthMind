import { Service, IAgentRuntime, ServiceType } from "@elizaos/core";
import { WebClient } from "@slack/web-api";
import { ISlackService } from "../types/slack-types";

/**
 * Service class for interacting with Slack API.
 */
export class SlackService extends Service implements ISlackService {
    public client: WebClient;

/**
 * Get the service type value.
 * @return {ServiceType} The service type value.
 */
    static get serviceType(): ServiceType {
        return ServiceType.SLACK;
    }

/**
 * Get the service type.
 * 
 * @returns {ServiceType} The type of service, which is Slack.
 */
    get serviceType(): ServiceType {
        return ServiceType.SLACK;
    }

/**
 * Initializes the Slack client with the provided token.
 * 
 * @param {IAgentRuntime} runtime - The runtime environment for the agent
 * @returns {Promise<void>} A promise that resolves once the client is initialized
 * @throws {Error} If the SLACK_BOT_TOKEN setting is not provided
 */
    async initialize(runtime: IAgentRuntime): Promise<void> {
        const token = runtime.getSetting("SLACK_BOT_TOKEN");
        if (!token) {
            throw new Error("SLACK_BOT_TOKEN is required");
        }
        this.client = new WebClient(token);
    }
}
