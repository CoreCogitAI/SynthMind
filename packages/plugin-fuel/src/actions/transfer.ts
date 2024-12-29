import {
    Action,
    composeContext,
    generateObjectDeprecated,
    IAgentRuntime,
    ModelClass,
    State,
} from "@elizaos/core";
import { initWalletProvider, WalletProvider } from "../providers/wallet";
import { bn } from "fuels";
import { transferTemplate } from "../templates";

/**
 * Represents the parameters required for transferring an amount to a specified address.
 * @typedef {Object} TransferParams
 * @property {string} toAddress - The address to transfer the amount to.
 * @property {string} amount - The amount to be transferred.
 */
type TransferParams = {
    toAddress: string;
    amount: string;
};

/**
 * Represents a transfer action to transfer funds from one wallet to another.
 */
 
export class TransferAction {
/**
 * Create a new instance of this class with the provided wallet provider.
 * 
 * @param {WalletProvider} walletProvider - The wallet provider to be used by this instance.
 */
    constructor(private walletProvider: WalletProvider) {}

/**
 * Asynchronously transfers a specified amount to a given address.
 * @param {TransferParams} params - The parameters for the transfer, including the recipient address and amount to transfer.
 * @returns {Promise<Transaction>} - A promise that resolves to the transaction object once the transfer is completed successfully.
 * @throws {Error} - If the transfer fails, an error is thrown with a message detailing the failure.
 */
    async transfer(params: TransferParams) {
        try {
            const { toAddress, amount } = params;
            const res = await this.walletProvider.wallet.transfer(
                toAddress,
                bn.parseUnits(amount)
            );
            const tx = await res.waitForResult();
            return tx;
        } catch (error) {
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }
}

const buildTransferDetails = async (state: State, runtime: IAgentRuntime) => {
    const context = composeContext({
        state,
        template: transferTemplate,
    });

    const transferDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as TransferParams;

    return transferDetails;
};

export const transferAction: Action = {
    name: "transfer",
    description: "Transfer Fuel ETH between addresses on Fuel Ignition",
    handler: async (runtime, message, state, options, callback) => {
        const walletProvider = await initWalletProvider(runtime);
        const action = new TransferAction(walletProvider);

        const paramOptions = await buildTransferDetails(state, runtime);

        try {
            const transferResp = await action.transfer(paramOptions);
            if (callback) {
                callback({
                    text: `Successfully transferred ${paramOptions.amount} ETH to ${paramOptions.toAddress}\nTransaction Hash: ${transferResp.id}`,
                    content: {
                        success: true,
                        hash: transferResp.id,
                        amount: paramOptions.amount,
                        recipient: paramOptions.toAddress,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during token transfer:", error);
            if (callback) {
                callback({
                    text: `Error transferring tokens: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    // template: transferTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("FUEL_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you transfer 1 ETH to 0x8F8afB12402C9a4bD9678Bec363E51360142f8443FB171655eEd55dB298828D1",
                    action: "SEND_TOKENS",
                },
            },
            {
                user: "user",
                content: {
                    text: "Transfer 1 ETH to 0x8F8afB12402C9a4bD9678Bec363E51360142f8443FB171655eEd55dB298828D1",
                    action: "SEND_TOKENS",
                },
            },
        ],
    ],
    similes: ["TRANSFER_FUEL_ETH"],
};
