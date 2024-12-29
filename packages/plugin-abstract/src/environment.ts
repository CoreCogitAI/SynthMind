import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const abstractEnvSchema = z.object({
    ABSTRACT_ADDRESS: z.string().min(1, "Abstract address is required"),
    ABSTRACT_PRIVATE_KEY: z.string().min(1, "Abstract private key is required"),
});

/**
 * Type definition representing the inferred type of the 'abstractEnvSchema' schema.
 */
export type AbstractConfig = z.infer<typeof abstractEnvSchema>;

/**
 * Validates the abstract configuration settings using a runtime object.
 * 
 * @param {IAgentRuntime} runtime The runtime object used to retrieve settings.
 * @returns {Promise<AbstractConfig>} The validated abstract configuration.
 * @throws {Error} Throws an error if the configuration is invalid.
 */
export async function validateAbstractConfig(
    runtime: IAgentRuntime
): Promise<AbstractConfig> {
    try {
        const config = {
            ABSTRACT_ADDRESS: runtime.getSetting("ABSTRACT_ADDRESS"),
            ABSTRACT_PRIVATE_KEY: runtime.getSetting("ABSTRACT_PRIVATE_KEY"),
        };

        return abstractEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Abstract configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
