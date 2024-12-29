import { IAgentRuntime } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { z } from "zod";

export const slackEnvSchema = z.object({
    SLACK_APP_ID: z.string().min(1, "Slack application ID is required"),
    SLACK_CLIENT_ID: z.string().min(1, "Slack client ID is required"),
    SLACK_CLIENT_SECRET: z.string().min(1, "Slack client secret is required"),
    SLACK_SIGNING_SECRET: z.string().min(1, "Slack signing secret is required"),
    SLACK_VERIFICATION_TOKEN: z
        .string()
        .min(1, "Slack verification token is required"),
    SLACK_BOT_TOKEN: z.string().min(1, "Slack bot token is required"),
    SLACK_SERVER_PORT: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 3000)),
});

/**
 * Type definition for Slack configuration based on the inferred type of slackEnvSchema.
 */
export type SlackConfig = z.infer<typeof slackEnvSchema>;

/**
 * Asynchronously validates Slack configuration using the provided runtime settings.
 * Retrieves Slack configuration settings from runtime, falling back to process environment variables if not available.
 * 
 * @param {IAgentRuntime} runtime - The agent runtime to retrieve settings from
 * @returns {Promise<SlackConfig>} - A Promise that resolves with the validated Slack configuration
 * @throws {Error} - If there is an error during configuration validation
 */
export async function validateSlackConfig(
    runtime: IAgentRuntime
): Promise<SlackConfig> {
    try {
        elizaLogger.debug(
            "Validating Slack configuration with runtime settings"
        );
        const config = {
            SLACK_APP_ID:
                runtime.getSetting("SLACK_APP_ID") || process.env.SLACK_APP_ID,
            SLACK_CLIENT_ID:
                runtime.getSetting("SLACK_CLIENT_ID") ||
                process.env.SLACK_CLIENT_ID,
            SLACK_CLIENT_SECRET:
                runtime.getSetting("SLACK_CLIENT_SECRET") ||
                process.env.SLACK_CLIENT_SECRET,
            SLACK_SIGNING_SECRET:
                runtime.getSetting("SLACK_SIGNING_SECRET") ||
                process.env.SLACK_SIGNING_SECRET,
            SLACK_VERIFICATION_TOKEN:
                runtime.getSetting("SLACK_VERIFICATION_TOKEN") ||
                process.env.SLACK_VERIFICATION_TOKEN,
            SLACK_BOT_TOKEN:
                runtime.getSetting("SLACK_BOT_TOKEN") ||
                process.env.SLACK_BOT_TOKEN,
            SLACK_SERVER_PORT:
                runtime.getSetting("SLACK_SERVER_PORT") ||
                process.env.SLACK_SERVER_PORT,
        };

        elizaLogger.debug("Parsing configuration with schema", config);
        const validated = slackEnvSchema.parse(config);
        elizaLogger.debug("Configuration validated successfully");
        return validated;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("\n");
            elizaLogger.error(
                "Configuration validation failed:",
                errorMessages
            );
            throw new Error(
                `Slack configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
