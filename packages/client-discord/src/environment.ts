import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const discordEnvSchema = z.object({
    DISCORD_APPLICATION_ID: z
        .string()
        .min(1, "Discord application ID is required"),
    DISCORD_API_TOKEN: z.string().min(1, "Discord API token is required"),
});

/**
 * Type definition for DiscordConfig based on the discordEnvSchema
 */
export type DiscordConfig = z.infer<typeof discordEnvSchema>;

/**
 * Validates the Discord configuration by retrieving the DISCORD_APPLICATION_ID and DISCORD_API_TOKEN from the runtime settings or environment variables.
 * 
 * @param {IAgentRuntime} runtime - The runtime object provided by the Agent.
 * @returns {Promise<DiscordConfig>} The validated Discord configuration.
 */
export async function validateDiscordConfig(
    runtime: IAgentRuntime
): Promise<DiscordConfig> {
    try {
        const config = {
            DISCORD_APPLICATION_ID:
                runtime.getSetting("DISCORD_APPLICATION_ID") ||
                process.env.DISCORD_APPLICATION_ID,
            DISCORD_API_TOKEN:
                runtime.getSetting("DISCORD_API_TOKEN") ||
                process.env.DISCORD_API_TOKEN,
        };

        return discordEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Discord configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
