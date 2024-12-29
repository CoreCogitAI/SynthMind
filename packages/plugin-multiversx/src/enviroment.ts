import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const multiversxEnvSchema = z.object({
    MVX_PRIVATE_KEY: z
        .string()
        .min(1, "MultiversX wallet private key is required"),
    MVX_NETWORK: z.enum(["mainnet", "devnet", "testnet"]),
});

/**
 * Represents the inferred type of the multiversxEnvSchema schema, which is used as the MultiversxConfig type.
 */
export type MultiversxConfig = z.infer<typeof multiversxEnvSchema>;

/**
 * Validates the MultiversX configuration by retrieving the required settings
 * from the runtime and environment variables, then parsing the configuration
 * using the multiversxEnvSchema.
 * 
 * @param {IAgentRuntime} runtime - The current agent runtime
 * @returns {Promise<MultiversxConfig>} The validated MultiversX configuration
 * @throws {Error} If there is an error during configuration validation
 */
export async function validateMultiversxConfig(
    runtime: IAgentRuntime
): Promise<MultiversxConfig> {
    try {
        const config = {
            MVX_PRIVATE_KEY:
                runtime.getSetting("MVX_PRIVATE_KEY") ||
                process.env.MVX_PRIVATE_KEY,
            MVX_NETWORK:
                runtime.getSetting("MVX_NETWORK") || process.env.MVX_NETWORK,
        };

        return multiversxEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `MultiversX configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
