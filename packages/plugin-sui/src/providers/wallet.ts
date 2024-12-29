import {
    IAgentRuntime,
    ICacheManager,
    Memory,
    Provider,
    State,
} from "@elizaos/core";

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

import { MIST_PER_SUI } from "@mysten/sui/utils";
import BigNumber from "bignumber.js";
import NodeCache from "node-cache";
import * as path from "path";

// Provider configuration
const PROVIDER_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
};

/**
 * Interface for representing a wallet portfolio.
 * @typedef {Object} WalletPortfolio
 * @property {string} totalUsd - The total amount in USD.
 * @property {string} totalSui - The total amount in SUI currency.
 */
interface WalletPortfolio {
    totalUsd: string;
    totalSui: string;
}

/**
 * Interface representing prices for different items.
 * @interface
 * @property {object} Prices - The prices object.
 * @property {object} sui - The sui item.
 * @property {string} usd - The price in USD for the sui item.
 */
interface Prices {
    sui: { usd: string };
}

/**
 * Represents the possible values for a SuiNetwork, which can be:
 * - "mainnet"
 * - "testnet"
 * - "devnet"
 * - "localnet"
 */
type SuiNetwork = "mainnet" | "testnet" | "devnet" | "localnet";

/**
 * Class representing a WalletProvider.
 */
 */
export class WalletProvider {
    private cache: NodeCache;
    private cacheKey: string = "sui/wallet";

/**
 * Constructor for creating an instance of MyClass.
 * @param {SuiClient} suiClient - The SuiClient instance to use.
 * @param {string} address - The address to be used.
 * @param {ICacheManager} cacheManager - The cache manager to handle caching.
 */
    constructor(
        private suiClient: SuiClient,
        private address: string,
        private cacheManager: ICacheManager
    ) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
    }

/**
 * Reads data from the cache using the specified key.
 * @param {string} key - The key to use for retrieving data from the cache.
 * @returns {Promise<T | null>} A Promise that resolves with the data retrieved from the cache, 
 * or null if no data was found for the specified key.
 */
    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(this.cacheKey, key)
        );
        return cached;
    }

/**
 * Write data to the cache with the given key and set an expiration time.
 * @param {string} key - The key for the data in the cache
 * @param {T} data - The data to be stored in the cache
 * @returns {Promise<void>} A Promise that resolves when the data is written to the cache
 */
    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(this.cacheKey, key), data, {
            expires: Date.now() + 5 * 60 * 1000,
        });
    }

/**
 * Retrieves data from cache if it exists, first checking in-memory cache and then file-based cache.
 * @template T
 * @param {string} key - The key used to retrieve the data from cache.
 * @returns {Promise<T | null>} The data retrieved from cache, or null if it is not found.
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
 * Sets cached data in memory and writes to file-based cache.
 * @param {string} cacheKey - The key to store the data in cache.
 * @param {T} data - The data to be cached.
 * @returns {Promise<void>} A promise that resolves once the data is successfully cached.
 */
    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Set in-memory cache
        this.cache.set(cacheKey, data);

        // Write to file-based cache
        await this.writeToCache(cacheKey, data);
    }

/**
 * Fetches prices with retry logic.
 * @returns {Promise<Object>} The data containing the prices fetched.
 * @throws {Error} Thrown when all retry attempts fail.
 */
    private async fetchPricesWithRetry() {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const cetusSuiUsdcPoolAddr =
                    "0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab";
                const response = await fetch(
                    `https://api.dexscreener.com/latest/dex/pairs/sui/${cetusSuiUsdcPoolAddr}`
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
 * Asynchronously fetches the value of the portfolio for the current wallet.
 * 
 * @returns {Promise<WalletPortfolio>} The portfolio value including total USD and total SUI amount.
 */
    async fetchPortfolioValue(): Promise<WalletPortfolio> {
        try {
            const cacheKey = `portfolio-${this.address}`;
            const cachedValue =
                await this.getCachedData<WalletPortfolio>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPortfolioValue", cachedValue);
                return cachedValue;
            }
            console.log("Cache miss for fetchPortfolioValue");

            const prices = await this.fetchPrices().catch((error) => {
                console.error("Error fetching SUI price:", error);
                throw error;
            });
            const suiAmountOnChain = await this.suiClient
                .getBalance({
                    owner: this.address,
                })
                .catch((error) => {
                    console.error("Error fetching SUI amount:", error);
                    throw error;
                });

            const suiAmount =
                Number.parseInt(suiAmountOnChain.totalBalance) /
                Number(MIST_PER_SUI);
            const totalUsd = new BigNumber(suiAmount).times(prices.sui.usd);

            const portfolio = {
                totalUsd: totalUsd.toString(),
                totalSui: suiAmount.toString(),
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
 * Asynchronously fetches the prices with a potential cache hit.
 * If the prices are cached, returns the cached data.
 * If not cached, fetches the prices and caches the data for future use.
 * 
 * @returns {Promise<Prices>} The prices object containing the SUI price in USD.
 * @throws {Error} If there is an error fetching the prices.
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

            const suiPriceData = await this.fetchPricesWithRetry().catch(
                (error) => {
                    console.error("Error fetching SUI price:", error);
                    throw error;
                }
            );
            const prices: Prices = {
                sui: { usd: suiPriceData.pair.priceUsd },
            };
            this.setCachedData(cacheKey, prices);
            return prices;
        } catch (error) {
            console.error("Error fetching prices:", error);
            throw error;
        }
    }

/**
 * Formats the portfolio information to be displayed.
 *
 * @param {Runtime} runtime - The runtime object containing character information.
 * @param {WalletPortfolio} portfolio - The portfolio to be formatted.
 * @returns {string} The formatted portfolio information string.
 */
    formatPortfolio(runtime, portfolio: WalletPortfolio): string {
        let output = `${runtime.character.name}\n`;
        output += `Wallet Address: ${this.address}\n`;

        const totalUsdFormatted = new BigNumber(portfolio.totalUsd).toFixed(2);
        const totalSuiFormatted = new BigNumber(portfolio.totalSui).toFixed(4);

        output += `Total Value: $${totalUsdFormatted} (${totalSuiFormatted} SUI)\n`;

        return output;
    }

/**
 * Asynchronously retrieves the portfolio value and formats it based on the given runtime value.
 * 
 * @param {any} runtime - The runtime value to be used for formatting the portfolio.
 * @returns {Promise<string>} A string representing the formatted portfolio value.
 */
    async getFormattedPortfolio(runtime): Promise<string> {
        try {
            const portfolio = await this.fetchPortfolioValue();
            return this.formatPortfolio(runtime, portfolio);
        } catch (error) {
            console.error("Error generating portfolio report:", error);
            return "Unable to fetch wallet information. Please try again later.";
        }
    }
}

const walletProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> => {
        const privateKey = runtime.getSetting("SUI_PRIVATE_KEY");
        const suiAccount = Ed25519Keypair.deriveKeypair(privateKey);

        try {
            const suiClient = new SuiClient({
                url: getFullnodeUrl(
                    runtime.getSetting("SUI_NETWORK") as SuiNetwork
                ),
            });
            const provider = new WalletProvider(
                suiClient,
                suiAccount.toSuiAddress(),
                runtime.cacheManager
            );
            return await provider.getFormattedPortfolio(runtime);
        } catch (error) {
            console.error("Error in wallet provider:", error);
            return null;
        }
    },
};

// Module exports
export { walletProvider };
