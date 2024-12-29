import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { IAgentRuntime, Provider, Memory, State } from "@elizaos/core";
import type {
    Address,
    WalletClient,
    PublicClient,
    Chain,
    HttpTransport,
    Account,
    PrivateKeyAccount,
} from "viem";
import * as viemChains from "viem/chains";

import type { SupportedChain } from "../types";

/**
 * Class representing a wallet provider for interacting with various blockchain chains.
 * @constructor
 * @param {string} privateKey - The private key to set for the wallet account.
 * @param {Record<string, Chain>} [chains] - Optional parameter for setting chains.
 * @class
 */
export class WalletProvider {
    private currentChain: SupportedChain = "mainnet";
    chains: Record<string, Chain> = { mainnet: viemChains.mainnet };
    account: PrivateKeyAccount;

/**
 * Constructor for creating an instance of the class with the provided private key and optional chains.
 *
 * @param privateKey - The private key in the format `0x${string}`.
 * @param chains - An optional object containing chains.
 */
    constructor(privateKey: `0x${string}`, chains?: Record<string, Chain>) {
        this.setAccount(privateKey);
        this.setChains(chains);

        if (chains && Object.keys(chains).length > 0) {
            this.setCurrentChain(Object.keys(chains)[0] as SupportedChain);
        }
    }

/**
 * Get the address associated with the account.
 * 
 * @returns {Address} The address of the account.
 */
    getAddress(): Address {
        return this.account.address;
    }

/**
 * Returns the current chain object from the list of chains.
 * 
 * @returns {Chain} The current chain object
 */ 
         
    getCurrentChain(): Chain {
        return this.chains[this.currentChain];
    }

/**
 * Returns a public client for the specified chain.
 * 
 * @param {SupportedChain} chainName - The name of the supported chain.
 * @returns {PublicClient<HttpTransport, Chain, Account | undefined>} The public client for the specified chain.
 */
    getPublicClient(
        chainName: SupportedChain
    ): PublicClient<HttpTransport, Chain, Account | undefined> {
        const transport = this.createHttpTransport(chainName);

        const publicClient = createPublicClient({
            chain: this.chains[chainName],
            transport,
        });
        return publicClient;
    }

/**
 * Get a wallet client for a specified blockchain.
 * @param {SupportedChain} chainName - The name of the blockchain to get the wallet client for.
 * @returns {WalletClient} The wallet client for the specified blockchain.
 */
    getWalletClient(chainName: SupportedChain): WalletClient {
        const transport = this.createHttpTransport(chainName);

        const walletClient = createWalletClient({
            chain: this.chains[chainName],
            transport,
            account: this.account,
        });

        return walletClient;
    }

/**
 * Retrieves the configuration object for a specific blockchain by name.
 * 
 * @param {SupportedChain} chainName - The name of the blockchain to retrieve configuration for.
 * @returns {Chain} The configuration object for the specified blockchain.
 * @throws {Error} If the specified blockchain name is invalid.
 */
    getChainConfigs(chainName: SupportedChain): Chain {
        const chain = viemChains[chainName];

        if (!chain?.id) {
            throw new Error("Invalid chain name");
        }

        return chain;
    }

/**
 * Asynchronously retrieves the current wallet balance.
 * 
 * @returns {Promise<string | null>} The balance of the wallet formatted as a string with 18 decimal places. Returns null if an error occurs during the retrieval process.
 */
    async getWalletBalance(): Promise<string | null> {
        try {
            const client = this.getPublicClient(this.currentChain);
            const balance = await client.getBalance({
                address: this.account.address,
            });
            return formatUnits(balance, 18);
        } catch (error) {
            console.error("Error getting wallet balance:", error);
            return null;
        }
    }

/**
 * Asynchronously retrieves the wallet balance for the specified blockchain chain.
 * 
 * @param {SupportedChain} chainName - The name of the supported blockchain chain.
 * @returns {Promise<string | null>} The balance of the wallet in string format or null if an error occurs.
 */
    async getWalletBalanceForChain(
        chainName: SupportedChain
    ): Promise<string | null> {
        try {
            const client = this.getPublicClient(chainName);
            const balance = await client.getBalance({
                address: this.account.address,
            });
            return formatUnits(balance, 18);
        } catch (error) {
            console.error("Error getting wallet balance:", error);
            return null;
        }
    }

/**
 * Add a chain to the record of chains.
 * 
 * @param {Record<string, Chain>} chain - The chain to add.
 */
    addChain(chain: Record<string, Chain>) {
        this.setChains(chain);
    }

/**
 * Switches the current selected chain to the specified chain name.
 * If the specified chain does not exist in the chains property, it will generate a new chain based on the provided chainName and customRpcUrl.
 * Finally, it sets the current chain to the specified chainName.
 * @param {SupportedChain} chainName - The name of the chain to switch to.
 * @param {string} [customRpcUrl] - The custom RPC URL to use for the newly generated chain.
 */
    switchChain(chainName: SupportedChain, customRpcUrl?: string) {
        if (!this.chains[chainName]) {
            const chain = WalletProvider.genChainFromName(
                chainName,
                customRpcUrl
            );
            this.addChain({ [chainName]: chain });
        }
        this.setCurrentChain(chainName);
    }

    private setAccount = (pk: `0x${string}`) => {
        this.account = privateKeyToAccount(pk);
    };

    private setChains = (chains?: Record<string, Chain>) => {
        if (!chains) {
            return;
        }
        Object.keys(chains).forEach((chain: string) => {
            this.chains[chain] = chains[chain];
        });
    };

    private setCurrentChain = (chain: SupportedChain) => {
        this.currentChain = chain;
    };

    private createHttpTransport = (chainName: SupportedChain) => {
        const chain = this.chains[chainName];

        if (chain.rpcUrls.custom) {
            return http(chain.rpcUrls.custom.http[0]);
        }
        return http(chain.rpcUrls.default.http[0]);
    };

/**
 * Generates a Chain object based on the given chain name and custom RPC URL.
 * @param {string} chainName - The name of the chain to generate.
 * @param {string | null} [customRpcUrl] - Optional custom RPC URL for the chain.
 * @returns {Chain} The generated Chain object.
 */
    static genChainFromName(
        chainName: string,
        customRpcUrl?: string | null
    ): Chain {
        const baseChain = viemChains[chainName];

        if (!baseChain?.id) {
            throw new Error("Invalid chain name");
        }

        const viemChain: Chain = customRpcUrl
            ? {
                  ...baseChain,
                  rpcUrls: {
                      ...baseChain.rpcUrls,
                      custom: {
                          http: [customRpcUrl],
                      },
                  },
              }
            : baseChain;

        return viemChain;
    }
}

const genChainsFromRuntime = (
    runtime: IAgentRuntime
): Record<string, Chain> => {
    const chainNames =
        (runtime.character.settings.chains?.evm as SupportedChain[]) || [];
    const chains = {};

    chainNames.forEach((chainName) => {
        const rpcUrl = runtime.getSetting(
            "ETHEREUM_PROVIDER_" + chainName.toUpperCase()
        );
        const chain = WalletProvider.genChainFromName(chainName, rpcUrl);
        chains[chainName] = chain;
    });

    const mainnet_rpcurl = runtime.getSetting("EVM_PROVIDER_URL");
    if (mainnet_rpcurl) {
        const chain = WalletProvider.genChainFromName(
            "mainnet",
            mainnet_rpcurl
        );
        chains["mainnet"] = chain;
    }

    return chains;
};

export const initWalletProvider = (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
    if (!privateKey) {
        throw new Error("EVM_PRIVATE_KEY is missing");
    }

    const chains = genChainsFromRuntime(runtime);

    return new WalletProvider(privateKey as `0x${string}`, chains);
};

export const evmWalletProvider: Provider = {
    async get(
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> {
        try {
            const walletProvider = initWalletProvider(runtime);
            const address = walletProvider.getAddress();
            const balance = await walletProvider.getWalletBalance();
            const chain = walletProvider.getCurrentChain();
            return `EVM Wallet Address: ${address}\nBalance: ${balance} ${chain.nativeCurrency.symbol}\nChain ID: ${chain.id}, Name: ${chain.name}`;
        } catch (error) {
            console.error("Error in EVM wallet provider:", error);
            return null;
        }
    },
};
