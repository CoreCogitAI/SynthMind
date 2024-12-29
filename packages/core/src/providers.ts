import { IAgentRuntime, State, type Memory } from "./types.ts";

/**
 * Formats provider outputs into a string which can be injected into the context.
 * @param runtime The AgentRuntime object.
 * @param message The incoming message object.
 * @param state The current state object.
 * @returns A string that concatenates the outputs of each provider.
 */
/**
 * Function to retrieve providers from the runtime and get results based on passed message and state.
 * @param {IAgentRuntime} runtime - The runtime object containing providers.
 * @param {Memory} message - The message to be passed to providers.
 * @param {State} [state] - Optional state object to be passed to providers.
 * @returns {Promise<string>} The results of the providers joined by newline character.
 */
export async function getProviders(
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
) {
    const providerResults = (
        await Promise.all(
            runtime.providers.map(async (provider) => {
                return await provider.get(runtime, message, state);
            })
        )
    ).filter((result) => result != null && result !== "");

    return providerResults.join("\n");
}
