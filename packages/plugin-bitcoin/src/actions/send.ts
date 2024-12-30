import {
    IAgentRuntime,
    Memory,
    State,
    Content,
    HandlerCallback,
    ActionExample,
    ModelClass,
} from "@elizaos/core";
import { composeContext, generateObjectDeprecated } from "@elizaos/core";
import { BitcoinConfig, NetworkName } from "../types";
import { BitcoinTaprootProvider } from "../providers/bitcoin";

export interface SendBitcoinContent extends Content {
    recipient: string;
    amount?: string | number;
    amountUSD?: string | number;
    amountSats?: string | number;
}

function isSendBitcoinContent(content: any): content is SendBitcoinContent {
    console.log("Content for bitcoin transfer:", content);
    return (
        typeof content.recipient === "string" &&
        (typeof content.amount === "string" ||
            typeof content.amount === "number" ||
            typeof content.amountUSD === "string" ||
            typeof content.amountUSD === "number" ||
            typeof content.amountSats === "string" ||
            typeof content.amountSats === "number")
    );
}

const sendBitcoinTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "recipient": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "amount": "0.001",
    "amountUSD": null,
    "amountSats": "100000"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested Bitcoin transfer:
- Recipient Bitcoin address
- Amount in BTC (if specified, e.g., "0.001 BTC", "1 bitcoin")
- Amount in USD (if specified, e.g., "$100", "100 dollars")
- Amount in satoshis (if specified, e.g., "100000 sats", "1000 satoshis")
- Whether to send all funds (if mentioned, e.g., "send all", "transfer entire balance")

Note: Only one amount type should be non-null. Convert to the specified unit if given with a different unit.
Respond with a JSON markdown block containing only the extracted values.`;

export const sendBitcoinAction = {
    name: "SEND_BITCOIN",
    description: "Send Bitcoin to an address",
    similes: ["TRANSFER_BTC", "SEND_BTC", "PAY_BITCOIN", "SEND_SATS"],
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback?: HandlerCallback
    ) => {
        console.log("Starting SEND_BITCOIN handler...");

        // Initialize or update state
        if (!state) {
            state = await runtime.composeState(message);
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Compose transfer context
        const transferContext = composeContext({
            state,
            template: sendBitcoinTemplate,
        });

        // Generate transfer content
        const content = await generateObjectDeprecated({
            runtime,
            context: transferContext,
            modelClass: ModelClass.SMALL,
        });

        // Validate transfer content
        if (!isSendBitcoinContent(content)) {
            console.error("Invalid content for SEND_BITCOIN action.");
            if (callback) {
                callback({
                    text: "I couldn't understand the transfer details. Please specify a Bitcoin address and amount (in BTC, USD, or sats).",
                    content: { error: "Invalid transfer content" },
                });
            }
            return false;
        }

        try {
            const privateKey = runtime.getSetting("BITCOIN_PRIVATE_KEY");
            const network = runtime.getSetting("BITCOIN_NETWORK") as
                | "bitcoin"
                | "testnet"
                | "signet"
                | "mutinynet";
            const arkServerUrl = runtime.getSetting("BITCOIN_ARK_SERVER_URL");
            const arkServerPublicKey = runtime.getSetting(
                "BITCOIN_ARK_SERVER_PUBLIC_KEY"
            );

            if (!privateKey || !network) {
                throw new Error("Bitcoin configuration is not set");
            }

            const provider = new BitcoinTaprootProvider({
                privateKey,
                network,
                arkServerUrl,
                arkServerPublicKey,
            } as BitcoinConfig);

            // Convert amounts if needed
            let amount: bigint | undefined;
            if (content.amount) {
                // Convert BTC to satoshis
                amount = BigInt(
                    Math.floor(Number(content.amount) * 100_000_000)
                );
            } else if (content.amountSats) {
                // Already in satoshis
                amount = BigInt(Math.floor(Number(content.amountSats)));
            } else if (content.amountUSD) {
                // Get current BTC price and convert USD to satoshis
                const price = await provider.getBitcoinPrice();
                const btcAmount = Number(content.amountUSD) / price.USD.last;
                amount = BigInt(Math.floor(btcAmount * 100_000_000));
            }

            const txid = await provider.sendBitcoin({
                address: content.recipient,
                amount,
            });

            if (callback) {
                let responseText: string;
                if (content.amountUSD) {
                    responseText = `Successfully sent $${content.amountUSD} worth of BTC to ${content.recipient}`;
                } else if (content.amount) {
                    responseText = `Successfully sent ${content.amount} BTC to ${content.recipient}`;
                } else if (content.amountSats) {
                    responseText = `Successfully sent ${content.amountSats} sats to ${content.recipient}`;
                } else {
                    responseText = `Successfully sent Bitcoin to ${content.recipient}`;
                }

                callback({
                    text: `${responseText}\nTransaction ID: ${txid}`,
                    content: {
                        success: true,
                        txid,
                        recipient: content.recipient,
                        amount: content.amount,
                        amountUSD: content.amountUSD,
                        amountSats: content.amountSats,
                    },
                });
            }

            return true;
        } catch (error) {
            console.error("Error during bitcoin transfer:", error);
            if (callback) {
                callback({
                    text: `Error sending Bitcoin: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        return (
            !!runtime.getSetting("BITCOIN_PRIVATE_KEY") &&
            !!runtime.getSetting("BITCOIN_NETWORK")
        );
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send 0.001 BTC to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll send 0.001 BTC now...",
                    action: "SEND_BITCOIN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully sent 0.001 BTC to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\nTransaction ID: 0x123...",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send $100 worth of bitcoin to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll send $100 worth of BTC now...",
                    action: "SEND_BITCOIN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully sent $100 worth of BTC to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\nTransaction ID: 0x456...",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send 100000 sats to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll send 100000 sats now...",
                    action: "SEND_BITCOIN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully sent 100000 sats to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\nTransaction ID: 0x789...",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send all my bitcoin to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll send all your BTC now...",
                    action: "SEND_BITCOIN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully sent all funds to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\nTransaction ID: 0xabc...",
                },
            },
        ],
    ],
};
