import { Action, IAgentRuntime, Memory, State } from "@elizaos/core";
import { BitcoinTaprootProvider } from "../providers/bitcoin";

export const balanceAction: Action = {
    name: "BALANCE",
    description: "Get Bitcoin wallet balance",
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What's my Bitcoin balance?" },
            },
        ],
        [{ user: "{{user1}}", content: { text: "Show me my BTC balance" } }],
    ],
    similes: [
        "BALANCE",
        "GETBALANCE",
        "SHOWBALANCE",
        "CHECKBALANCE",
        "DISPLAYBALANCE",
        "MYBALANCE",
        "HOWMUCHBTC",
        "WHATSMYBALANCE",
    ],

    async validate(runtime: IAgentRuntime): Promise<boolean> {
        return !!runtime.providers.find(
            (p) => p instanceof BitcoinTaprootProvider
        );
    },

    async handler(
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _match: any
    ) {
        try {
            const provider = runtime.providers.find(
                (p): p is BitcoinTaprootProvider =>
                    p instanceof BitcoinTaprootProvider
            );

            if (!provider) {
                return {
                    text: "Bitcoin provider not found. Please check your configuration.",
                };
            }

            const [balance, price] = await Promise.all([
                provider.getWalletBalance(),
                provider.getBitcoinPrice(),
            ]);

            const onchainTotal = balance.onchain.total;
            const offchainTotal = balance.offchain.total;
            const total = balance.total;

            const onchainUSD = (onchainTotal * price.USD.last) / 100_000_000;
            const offchainUSD = (offchainTotal * price.USD.last) / 100_000_000;
            const totalUSD = (total * price.USD.last) / 100_000_000;

            return {
                text: `Bitcoin Balance:
Total: ${total.toLocaleString()} sats (≈ $${totalUSD.toFixed(2)} USD)
├─ Onchain: ${onchainTotal.toLocaleString()} sats (≈ $${onchainUSD.toFixed(2)} USD)
│  ├─ Confirmed: ${balance.onchain.confirmed.toLocaleString()} sats
│  └─ Unconfirmed: ${balance.onchain.unconfirmed.toLocaleString()} sats
└─ Offchain: ${offchainTotal.toLocaleString()} sats (≈ $${offchainUSD.toFixed(2)} USD)
   ├─ Settled: ${balance.offchain.settled.toLocaleString()} sats
   ├─ Pending: ${balance.offchain.pending.toLocaleString()} sats
   └─ Swept: ${balance.offchain.swept.toLocaleString()} sats`,
            };
        } catch (error) {
            console.error("Error in balance action:", error);
            return {
                text: "Unable to fetch your Bitcoin balance at the moment. Please try again later.",
            };
        }
    },
};
