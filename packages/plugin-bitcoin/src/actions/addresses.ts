import { IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { BitcoinTaprootProvider } from "../providers/bitcoin";

export const showBitcoinAddressesAction = {
    name: "SHOW_BITCOIN_ADDRESSES",
    description: "Show Bitcoin wallet addresses",
    similes: [
        "SHOW_ADDRESSES",
        "GET_ADDRESSES",
        "DISPLAY_ADDRESSES",
        "SHOW_WALLET",
    ],
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        try {
            const bitcoinProvider = runtime.providers.find(
                (p) => p instanceof BitcoinTaprootProvider
            ) as BitcoinTaprootProvider;

            if (!bitcoinProvider) {
                return {
                    text: "Bitcoin provider not found. Please check your configuration.",
                };
            }

            const addresses = await bitcoinProvider.getAddress();

            if (callback) {
                callback({
                    text: `Here are your Bitcoin addresses:

⛓️ Onchain: ${addresses.onchain}
⚡️ Offchain: ${addresses.offchain || "Not configured"}`,
                });
            }

            return {
                text: `Here are your Bitcoin addresses:

⛓️ Onchain: ${addresses.onchain}
⚡️ Offchain: ${addresses.offchain || "Not configured"}`,
            };
        } catch (error) {
            console.error("Error fetching addresses:", error);
            return {
                text: "Unable to fetch your Bitcoin addresses at the moment. Please try again later.",
            };
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        return runtime.providers.some(
            (p) => p instanceof BitcoinTaprootProvider
        );
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show my Bitcoin addresses",
                },
            },
        ],
    ],
};
