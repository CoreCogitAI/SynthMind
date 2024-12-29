import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const aptosEnvSchema = z.object({
    APTOS_PRIVATE_KEY: z.string().min(1, "Aptos private key is required"),
    APTOS_NETWORK: z.enum(["mainnet", "testnet"]),
});

/**
 * Type definition for AptosConfig using the inferred type from aptosEnvSchema.
 */
export type AptosConfig = z.infer<typeof aptosEnvSchema>;

/**
 * Validates the Aptos configuration by retrieving the required settings using the provided runtime.
 * If the required settings are not found in the runtime, falls back to process environment variables.
 * Uses Zod schema for validating the configuration.
 * 
 * @param {IAgentRuntime} runtime - The runtime interface providing access to settings.
 * @returns {Promise<AptosConfig>} The validated Aptos configuration.
 */
export async function validateAptosConfig(
    runtime: IAgentRuntime
): Promise<AptosConfig> {
    try {
        const config = {
            APTOS_PRIVATE_KEY:
                runtime.getSetting("APTOS_PRIVATE_KEY") ||
                process.env.APTOS_PRIVATE_KEY,
            APTOS_NETWORK:
                runtime.getSetting("APTOS_NETWORK") ||
                process.env.APTOS_NETWORK,
        };

        return aptosEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Aptos configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
