import {
    IAgentRuntime,
    ICacheManager,
    Memory,
    Provider,
    State,
} from "@elizaos/core";

import { TonClient, WalletContractV4 } from "@ton/ton";
import { KeyPair, mnemonicToPrivateKey } from "@ton/crypto";

import NodeCache from "node-cache";
import * as path from "path";
import BigNumber from "bignumber.js";

const PROVIDER_CONFIG = {
    MAINNET_RPC: "https://toncenter.com/api/v2/jsonRPC",
    STONFI_TON_USD_POOL: "EQCGScrZe1xbyWqWDvdI6mzP-GAcAWFv6ZXuaJOuSqemxku4",
    CHAIN_NAME_IN_DEXSCREENER: "ton",
    // USD_DECIMAL=10^6
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    // 10^9
    TON_DECIMAL: BigInt(1000000000),
};
// settings
// TON_PRIVATE_KEY, TON_RPC_URL

/**
 * Represents the portfolio of a wallet, containing information about the total value in USD and the total amount of native tokens.
 * @interface WalletPortfolio
 * @property {string} totalUsd - The total value in USD.
 * @property {string} totalNativeToken - The total amount of native tokens.
 */
interface WalletPortfolio {
    totalUsd: string;
    totalNativeToken: string;
}

/**
 * Interface representing prices.
 * @typedef {object} Prices
 * @property {{ usd: string }} nativeToken - Object containing the price in USD of the native token.
 */
interface Prices {
    nativeToken: { usd: string };
}

/**
 * Class representing a Wallet Provider.
 * @class
 */
 */
export class WalletProvider {
    keypair: KeyPair;
    wallet: WalletContractV4;
    private cache: NodeCache;
    private cacheKey: string = "ton/wallet";

    // reqiure hex private key
/**
 * Constructor for creating a new instance of the MyClass class.
 * @param {KeyPair} keypair - The key pair used for encryption and decryption.
 * @param {string} endpoint - The endpoint for making API calls.
 * @param {ICacheManager} cacheManager - The cache manager for storing data.
 */
    constructor(
        // mnemonic: string,
        keypair: KeyPair,
        private endpoint: string,
        private cacheManager: ICacheManager
    ) {
        this.keypair = keypair;
        this.cache = new NodeCache({ stdTTL: 300 });
        this.wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: keypair.publicKey,
        });
    }

    // thanks to plugin-sui
/**
 * Asynchronously reads data from the cache using the provided key.
 * 
 * @template T - The type of data to be read from the cache
 * @param {string} key - The key to retrieve the data from the cache
 * @returns {Promise<T | null>} A promise that resolves with the data from the cache, or null if the data is not found
 */
    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(this.cacheKey, key)
        );
        return cached;
    }

/**
 * Writes data to the cache with a specified key and expiration time.
 * @param {string} key - The key to store the data with in the cache.
 * @param {T} data - The data to store in the cache.
 * @returns {Promise<void>} A promise that resolves once the data has been written to the cache.
 */
    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(this.cacheKey, key), data, {
            expires: Date.now() + 5 * 60 * 1000,
        });
    }

/**
 * Retrieves cached data of type T using the provided key.
 * 
 * @param key - The key used to retrieve the cached data.
 * @returns A Promise that resolves with the cached data or null if not found.
 */
    private async getCachedData<T>(key: string): Promise<T | null> {
        // Check in-memory cache first
        const cachedData = this.cache.get<T>(key);
        if (cachedData) {
            return cachedData;
        }

        // Check file-based cache
        const fileCachedData = await this.readFromCache<T>(key);
        if (fileCachedData) {
            // Populate in-memory cache
            this.cache.set(key, fileCachedData);
            return fileCachedData;
        }

        return null;
    }

/**
 * Store the provided data in both in-memory cache and file-based cache.
 * 
 * @template T
 * @param {string} cacheKey - The key to store the data in the cache
 * @param {T} data - The data to be stored in the cache
 * @returns {Promise<void>} A Promise that resolves when the data is successfully stored in both caches
 */
    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Set in-memory cache
        this.cache.set(cacheKey, data);

        // Write to file-based cache
        await this.writeToCache(cacheKey, data);
    }

/**
 * Function to fetch prices with retry mechanism in place.
 * Will attempt to fetch the prices from the specified URL,
 * and if the request fails, will retry up to MAX_RETRIES times
 * with an increasing delay between each attempt.
 * 
 * @returns {Promise<object>} The fetched data if successful.
 * 
 * @throws {Error} If all attempts fail, will throw the last error encountered.
 */
    private async fetchPricesWithRetry() {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(
                    `https://api.dexscreener.com/latest/dex/pairs/${PROVIDER_CONFIG.CHAIN_NAME_IN_DEXSCREENER}/${PROVIDER_CONFIG.STONFI_TON_USD_POOL}`
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `HTTP error! status: ${response.status}, message: ${errorText}`
                    );
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                lastError = error;
                if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
                    const delay = PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        console.error(
            "All attempts failed. Throwing the last error:",
            lastError
        );
        throw lastError;
    }

/**
 * Asynchronously fetches prices from an API and returns a Promise of Prices object.
 * Utilizes caching to optimize performance by checking for cached data first.
 * If cache hit, returns cached value. If cache miss, fetches prices from the API with retry logic.
 * 
 * @returns {Promise<Prices>} A Promise that resolves to a Prices object containing native token price in USD.
 * @throws {Error} If there is an error while fetching prices.
 */
    async fetchPrices(): Promise<Prices> {
        try {
            const cacheKey = "prices";
            const cachedValue = await this.getCachedData<Prices>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPrices");
                return cachedValue;
            }
            console.log("Cache miss for fetchPrices");

            const priceData = await this.fetchPricesWithRetry().catch(
                (error) => {
                    console.error(
                        `Error fetching ${PROVIDER_CONFIG.CHAIN_NAME_IN_DEXSCREENER.toUpperCase()} price:`,
                        error
                    );
                    throw error;
                }
            );
            const prices: Prices = {
                nativeToken: { usd: priceData.pair.priceUsd },
            };
            this.setCachedData(cacheKey, prices);
            return prices;
        } catch (error) {
            console.error("Error fetching prices:", error);
            throw error;
        }
    }

/**
 * Format the given portfolio data into a human-readable string format.
 * 
 * @param {IAgentRuntime} runtime - The runtime instance of the agent.
 * @param {WalletPortfolio} portfolio - The portfolio data to format.
 * @returns {string} The formatted portfolio data as a string.
 */
    private formatPortfolio(
        runtime: IAgentRuntime,
        portfolio: WalletPortfolio
    ): string {
        let output = `${runtime.character.name}\n`;
        output += `Wallet Address: ${this.getAddress()}\n`;

        const totalUsdFormatted = new BigNumber(portfolio.totalUsd).toFixed(2);
        const totalNativeTokenFormatted = new BigNumber(
            portfolio.totalNativeToken
        ).toFixed(4);

        output += `Total Value: $${totalUsdFormatted} (${totalNativeTokenFormatted} ${PROVIDER_CONFIG.CHAIN_NAME_IN_DEXSCREENER.toUpperCase()})\n`;

        return output;
    }

/**
 * Fetches the portfolio value of the wallet.
 * 
 * @returns {Promise<WalletPortfolio>} The portfolio value of the wallet.
 */
    private async fetchPortfolioValue(): Promise<WalletPortfolio> {
        try {
            const cacheKey = `portfolio-${this.getAddress()}`;
            const cachedValue =
                await this.getCachedData<WalletPortfolio>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPortfolioValue", cachedValue);
                return cachedValue;
            }
            console.log("Cache miss for fetchPortfolioValue");

            const prices = await this.fetchPrices().catch((error) => {
                console.error(
                    `Error fetching ${PROVIDER_CONFIG.CHAIN_NAME_IN_DEXSCREENER.toUpperCase()} price:`,
                    error
                );
                throw error;
            });
            const nativeTokenBalance = await this.getWalletBalance().catch(
                (error) => {
                    console.error(
                        `Error fetching ${PROVIDER_CONFIG.CHAIN_NAME_IN_DEXSCREENER.toUpperCase()} amount:`,
                        error
                    );
                    throw error;
                }
            );

            const amount =
                Number(nativeTokenBalance) /
                Number(PROVIDER_CONFIG.TON_DECIMAL);
            const totalUsd = new BigNumber(amount.toString()).times(
                prices.nativeToken.usd
            );

            const portfolio = {
                totalUsd: totalUsd.toString(),
                totalNativeToken: amount.toString(),
            };
            this.setCachedData(cacheKey, portfolio);
            console.log("Fetched portfolio:", portfolio);
            return portfolio;
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            throw error;
        }
    }

/**
 * Asynchronously fetches and formats the portfolio value.
 * 
 * @param {IAgentRuntime} runtime - The runtime of the agent.
 * @returns {Promise<string>} The formatted portfolio value as a string.
 */
    async getFormattedPortfolio(runtime: IAgentRuntime): Promise<string> {
        try {
            const portfolio = await this.fetchPortfolioValue();
            return this.formatPortfolio(runtime, portfolio);
        } catch (error) {
            console.error("Error generating portfolio report:", error);
            return "Unable to fetch wallet information. Please try again later.";
        }
    }

/**
 * Retrieve and return the formatted address of the wallet.
 * 
 * @returns {string} The formatted address of the wallet.
 */
    getAddress(): string {
        const formattedAddress = this.wallet.address.toString({
            bounceable: false,
            urlSafe: true,
        });
        return formattedAddress;
    }

/**
 * Retrieves a new instance of TonClient with the specified endpoint.
 * @returns {TonClient} The new instance of TonClient.
 */
    getWalletClient(): TonClient {
        const client = new TonClient({
            endpoint: this.endpoint,
        });
        return client;
    }

/**
 * Asynchronously retrieves the balance of the wallet.
 * @returns {Promise<bigint | null>} The wallet balance if successful, otherwise null.
 */
    async getWalletBalance(): Promise<bigint | null> {
        try {
            const client = this.getWalletClient();
            const contract = client.open(this.wallet);
            const balance = await contract.getBalance();

            return balance;
        } catch (error) {
            console.error("Error getting wallet balance:", error);
            return null;
        }
    }
}

export const initWalletProvider = async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("TON_PRIVATE_KEY");
    let mnemonics: string[];

    if (!privateKey) {
        throw new Error("TON_PRIVATE_KEY is missing");
    } else {
        mnemonics = privateKey.split(" ");
        if (mnemonics.length < 2) {
            throw new Error("TON_PRIVATE_KEY mnemonic seems invalid");
        }
    }
    const rpcUrl =
        runtime.getSetting("TON_RPC_URL") || PROVIDER_CONFIG.MAINNET_RPC;

    const keypair = await mnemonicToPrivateKey(mnemonics, "");
    return new WalletProvider(keypair, rpcUrl, runtime.cacheManager);
};

export const nativeWalletProvider: Provider = {
    async get(
        runtime: IAgentRuntime,
        message: Memory,
        state?: State
    ): Promise<string | null> {
        try {
            const walletProvider = await initWalletProvider(runtime);
            return await walletProvider.getFormattedPortfolio(runtime);
        } catch (error) {
            console.error(
                `Error in ${PROVIDER_CONFIG.CHAIN_NAME_IN_DEXSCREENER.toUpperCase()} wallet provider:`,
                error
            );
            return null;
        }
    },
};
