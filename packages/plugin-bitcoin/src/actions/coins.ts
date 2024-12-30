import { Action, IAgentRuntime } from "@elizaos/core";
import { BitcoinTaprootProvider } from "../providers/bitcoin";

export const coinsAction: Action = {
    name: "COINS",
    description: "List your Bitcoin UTXOs",
    similes: ["LISTCOINS", "LISTUTXOS", "SHOWUTXOS"],
    examples: [
        [{ user: "{{user1}}", content: { text: "Show my coins" } }],
        [{ user: "{{user1}}", content: { text: "List UTXOs" } }],
    ],
    validate: async (runtime: IAgentRuntime) => {
        return !!runtime.providers.find(
            (p) => p instanceof BitcoinTaprootProvider
        );
    },
    handler: async (runtime: IAgentRuntime) => {
        try {
            const provider = runtime.providers.find(
                (p) => p instanceof BitcoinTaprootProvider
            ) as BitcoinTaprootProvider;

            if (!provider) {
                return {
                    text: "Bitcoin provider not found.\nPlease check your configuration.",
                };
            }

            const coins = await provider.getCoins();

            if (!coins || coins.length === 0) {
                return {
                    text: "Bitcoin UTXOs:\n\n└─ No confirmed UTXOs\n└─ No unconfirmed UTXOs",
                };
            }

            const confirmedCoins = coins.filter(
                (coin) => coin.status.confirmed
            );
            const unconfirmedCoins = coins.filter(
                (coin) => !coin.status.confirmed
            );

            const confirmedTotal = confirmedCoins.reduce(
                (sum, coin) => sum + coin.value,
                0
            );
            const unconfirmedTotal = unconfirmedCoins.reduce(
                (sum, coin) => sum + coin.value,
                0
            );

            let output = "Bitcoin UTXOs:\n\n";

            // Add confirmed UTXOs
            output += `Confirmed UTXOs (Total: ${confirmedTotal} sats):\n`;
            if (confirmedCoins.length === 0) {
                output += "└─ No confirmed UTXOs\n";
            } else {
                confirmedCoins.forEach((coin) => {
                    output += `└─ ${coin.txid}:${coin.vout} (${coin.value} sats)\n`;
                });
            }

            // Add unconfirmed UTXOs
            output += `\nUnconfirmed UTXOs (Total: ${unconfirmedTotal} sats):\n`;
            if (unconfirmedCoins.length === 0) {
                output += "└─ No unconfirmed UTXOs\n";
            } else {
                unconfirmedCoins.forEach((coin) => {
                    output += `└─ ${coin.txid}:${coin.vout} (${coin.value} sats)\n`;
                });
            }

            return { text: output };
        } catch (error) {
            console.error("Error in coins action:", error);
            return {
                text: "Unable to fetch your Bitcoin coins at the moment. Please try again later.",
            };
        }
    },
};
