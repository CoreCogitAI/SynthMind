import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const telegramEnvSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().min(1, "Telegram bot token is required"),
});

/**
 * This line of code exports the type TelegramConfig which is inferred from the telegramEnvSchema.
 */
export type TelegramConfig = z.infer<typeof telegramEnvSchema>;

/**
 * Asynchronously validates the Telegram configuration by retrieving the TELEGRAM_BOT_TOKEN from the runtime settings or environment variables 
 * and parsing it using the telegramEnvSchema.
 * 
 * @param {IAgentRuntime} runtime - The runtime instance to retrieve settings from.
 * @returns {Promise<TelegramConfig>} - A Promise that resolves to a validated Telegram configuration.
 * @throws {Error} - If the validation fails, it throws an error with detailed error messages.
 */
export async function validateTelegramConfig(
    runtime: IAgentRuntime
): Promise<TelegramConfig> {
    try {
        const config = {
            TELEGRAM_BOT_TOKEN:
                runtime.getSetting("TELEGRAM_BOT_TOKEN") ||
                process.env.TELEGRAM_BOT_TOKEN,
        };

        return telegramEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Telegram configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
