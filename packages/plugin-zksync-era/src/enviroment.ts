import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const zksyncEnvSchema = z.object({
    ZKSYNC_ADDRESS: z.string().min(1, "ZKsync address is required"),
    ZKSYNC_PRIVATE_KEY: z.string().min(1, "ZKsync private key is required"),
});

/**
 * Type definition for ZKsyncConfig inferred from zksyncEnvSchema.
 */
export type ZKsyncConfig = z.infer<typeof zksyncEnvSchema>;

/**
 * Validates the ZKsync configuration by retrieving the ZKSYNC_ADDRESS and ZKSYNC_PRIVATE_KEY settings from the runtime
 * or environment variables, and then parsing it using zksyncEnvSchema.
 * 
 * @param {IAgentRuntime} runtime - The Agent Runtime instance
 * @returns {Promise<ZKsyncConfig>} - A Promise that resolves to the validated ZKsync configuration
 * @throws {Error} - If the ZKsync configuration validation fails
 */
export async function validateZKsyncConfig(
    runtime: IAgentRuntime
): Promise<ZKsyncConfig> {
    try {
        const config = {
            ZKSYNC_ADDRESS:
                runtime.getSetting("ZKSYNC_ADDRESS") ||
                process.env.ZKSYNC_ADDRESS,
            ZKSYNC_PRIVATE_KEY:
                runtime.getSetting("ZKSYNC_PRIVATE_KEY") ||
                process.env.ZKSYNC_PRIVATE_KEY,
        };

        return zksyncEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `ZKsync configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
