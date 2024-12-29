import { createEventAdapter } from "@slack/events-api";
import { WebClient } from "@slack/web-api";
import { SlackConfig } from "./types/slack-types";
import { MessageManager } from "./messages";
import { elizaLogger } from "@elizaos/core";

/**
 * Class representing a Slack Event Handler
 * @constructor
 * @param {SlackConfig} config - The configuration settings for Slack
 * @param {WebClient} client - The WebClient instance for interacting with Slack API
 * @param {MessageManager} messageManager - The message manager for handling Slack messages
 */ 
 */
export class EventHandler {
    private events: ReturnType<typeof createEventAdapter>;
    private messageManager: MessageManager;

/**
 * Initialize the Slack event handler with the provided configuration, WebClient instance, and MessageManager instance.
 * 
 * @param {SlackConfig} config - The configuration settings for Slack.
 * @param {WebClient} client - The WebClient instance used to interact with the Slack API.
 * @param {MessageManager} messageManager - The MessageManager instance used to manage messages.
 */
    constructor(
        config: SlackConfig,
        client: WebClient,
        messageManager: MessageManager
    ) {
        elizaLogger.log("🎮 Initializing Slack event handler...");
        elizaLogger.debug(
            "Creating event adapter with signing secret:",
            config.signingSecret.slice(0, 4) + "..."
        );
        this.events = createEventAdapter(config.signingSecret);
        this.messageManager = messageManager;

        this.setupEventListeners();
        elizaLogger.log("✅ Event handler initialization complete");
    }

/**
 * Sets up event listeners for handling various Slack events such as URL verification, messages, app mentions, reactions, and errors.
 * 
 * @private
 * @returns {void}
 */
    private setupEventListeners() {
        elizaLogger.log("📡 Setting up event listeners...");

        // Handle URL verification
        this.events.on("url_verification", (event: any) => {
            elizaLogger.debug("🔍 [URL_VERIFICATION] Received challenge:", {
                type: event.type,
                challenge: event.challenge,
            });
            return event.challenge;
        });

        // Handle messages
        this.events.on("message", async (event: any) => {
            try {
                elizaLogger.debug("📨 [MESSAGE] Received message event:", {
                    type: event.type,
                    subtype: event.subtype,
                    user: event.user,
                    channel: event.channel,
                    text: event.text,
                    ts: event.ts,
                    thread_ts: event.thread_ts,
                    raw_event: JSON.stringify(event, null, 2),
                });
                await this.messageManager.handleMessage(event);
            } catch (error) {
                elizaLogger.error(
                    "❌ [MESSAGE] Error handling message event:",
                    error
                );
            }
        });

        // Handle app mentions
        this.events.on("app_mention", async (event: any) => {
            try {
                elizaLogger.debug("🔔 [MENTION] Received app mention event:", {
                    type: event.type,
                    user: event.user,
                    channel: event.channel,
                    text: event.text,
                    ts: event.ts,
                    thread_ts: event.thread_ts,
                    raw_event: JSON.stringify(event, null, 2),
                });
                await this.messageManager.handleMessage(event);
            } catch (error) {
                elizaLogger.error(
                    "❌ [MENTION] Error handling app mention event:",
                    error
                );
            }
        });

        // Handle reactions
        this.events.on("reaction_added", async (event: any) => {
            try {
                elizaLogger.debug("⭐ [REACTION] Reaction added:", {
                    type: event.type,
                    user: event.user,
                    reaction: event.reaction,
                    item: event.item,
                    raw_event: JSON.stringify(event, null, 2),
                });
                // TODO: Implement reaction handling
            } catch (error) {
                elizaLogger.error(
                    "❌ [REACTION] Error handling reaction_added event:",
                    error
                );
            }
        });

        this.events.on("reaction_removed", async (event: any) => {
            try {
                elizaLogger.debug("💫 [REACTION] Reaction removed:", {
                    type: event.type,
                    user: event.user,
                    reaction: event.reaction,
                    item: event.item,
                    raw_event: JSON.stringify(event, null, 2),
                });
                // TODO: Implement reaction handling
            } catch (error) {
                elizaLogger.error(
                    "❌ [REACTION] Error handling reaction_removed event:",
                    error
                );
            }
        });

        // Handle errors
        this.events.on("error", (error: Error) => {
            elizaLogger.error("❌ [ERROR] Slack Events API error:", error);
        });

        // Add debug logging for all events
        this.events.on("*", (event: any) => {
            elizaLogger.debug("🔄 [RAW] Raw Slack event received:", {
                type: event.type,
                subtype: event.subtype,
                user: event.user,
                channel: event.channel,
                ts: event.ts,
                raw_event: JSON.stringify(event, null, 2),
            });
        });

        elizaLogger.log("✅ Event listeners setup complete");
    }

/**
 * Get the event adapter for express middleware.
 * @returns {any} The event adapter
 */
    public getEventAdapter() {
        elizaLogger.debug(
            "🔌 [ADAPTER] Returning event adapter for express middleware"
        );
        return this.events;
    }
}
