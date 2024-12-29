import { WalletClient } from "@goat-sdk/core";
import { viem } from "@goat-sdk/wallet-viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Add the chain you want to use, remember to update also
// the EVM_PROVIDER_URL to the correct one for the chain
export const chain = base;

/**
 * Retrieves a wallet client based on the provided settings.
 *
 * @param {Function} getSetting - The function used to retrieve the setting value based on a key.
 * @returns {Object|null} - The wallet client object or null if the private key is not provided.
 * @throws {Error} - If the EVM_PROVIDER_URL setting is not configured.
 */
export function getWalletClient(
    getSetting: (key: string) => string | undefined
) {
    const privateKey = getSetting("EVM_PRIVATE_KEY");
    if (!privateKey) return null;

    const provider = getSetting("EVM_PROVIDER_URL");
    if (!provider) throw new Error("EVM_PROVIDER_URL not configured");

    const wallet = createWalletClient({
        account: privateKeyToAccount(privateKey as `0x${string}`),
        chain: chain,
        transport: http(provider),
    });

    return viem(wallet);
}

/**
 * Returns a wallet provider object that can retrieve the EVM wallet address and balance.
 * 
 * @param {WalletClient} walletClient - The client for interacting with the wallet.
 * @returns {{get: () => Promise<string | null>}} - An object with a `get` method that returns a Promise resolving to the EVM wallet address and balance, or null if an error occurs.
 */
export function getWalletProvider(walletClient: WalletClient) {
    return {
        async get(): Promise<string | null> {
            try {
                const address = walletClient.getAddress();
                const balance = await walletClient.balanceOf(address);
                return `EVM Wallet Address: ${address}\nBalance: ${balance} ETH`;
            } catch (error) {
                console.error("Error in EVM wallet provider:", error);
                return null;
            }
        },
    };
}
