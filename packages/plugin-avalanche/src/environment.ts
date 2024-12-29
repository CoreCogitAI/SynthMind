import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const avalancheEnvSchema = z.object({
    AVALANCHE_PRIVATE_KEY: z
        .string()
        .min(1, "Avalanche private key is required"),
});

/**
 * Type definition for AvalancheConfig based on the inferred type from avalancheEnvSchema
 */
export type AvalancheConfig = z.infer<typeof avalancheEnvSchema>;
/**
 * Validates the Avalanche configuration settings by retrieving the AVALANCHE_PRIVATE_KEY from the runtime or environment variables,
 * and then parsing it using the avalancheEnvSchema.
 * 
 * @param {IAgentRuntime} runtime - The runtime object containing the settings and environment variables.
 * @returns {Promise<AvalancheConfig>} The validated Avalanche configuration.
 * @throws {Error} If there is an error parsing the configuration, it will be caught and re-thrown with detailed error messages.
 */
export async function validateAvalancheConfig(
    runtime: IAgentRuntime
): Promise<AvalancheConfig> {
    try {
        const config = {
            AVALANCHE_PRIVATE_KEY:
                runtime.getSetting("AVALANCHE_PRIVATE_KEY") ||
                process.env.AVALANCHE_PRIVATE_KEY,
        };

        return avalancheEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(errorMessages);
        }
        throw error;
    }
}
