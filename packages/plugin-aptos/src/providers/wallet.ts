import {
    IAgentRuntime,
    ICacheManager,
    Memory,
    Provider,
    State,
} from "@elizaos/core";
import {
    Account,
    Aptos,
    AptosConfig,
    Ed25519PrivateKey,
    Network,
    PrivateKey,
    PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import BigNumber from "bignumber.js";
import NodeCache from "node-cache";
import * as path from "path";
import { APT_DECIMALS } from "../constants";

// Provider configuration
const PROVIDER_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
};

/**
 * Interface representing a wallet portfolio.
 * @property {string} totalUsd - The total amount in USD.
 * @property {string} totalApt - The total amount in a different currency (e.g. Apt).
 */
interface WalletPortfolio {
    totalUsd: string;
    totalApt: string;
}

/**
 * Interface representing prices in different currencies.
 * @typedef {Object} Prices
 * @property {Object} apt - Object representing apartment prices.
 * @property {string} apt.usd - Price of apartment in USD.
 */
interface Prices {
    apt: { usd: string };
}

/**
 * Represents a Wallet Provider that interacts with the Aptos blockchain to manage wallet data.
 */
 */
export class WalletProvider {
    private cache: NodeCache;
    private cacheKey: string = "aptos/wallet";

/**
 * Constructor for creating an instance of a class.
 * @param {Aptos} aptosClient - The Aptos client used for communication.
 * @param {string} address - The address associated with the instance.
 * @param {ICacheManager} cacheManager - The cache manager used for caching data.
 */
    constructor(
        private aptosClient: Aptos,
        private address: string,
        private cacheManager: ICacheManager
    ) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
    }

/**
 * Reads a value from cache using the provided key.
 *
 * @template T - The type of the value to be retrieved from cache.
 * @param {string} key - The key used to retrieve the value from cache.
 * @returns {Promise<T | null>} - A Promise that resolves to the cached value if found, or null if not found.
 */
    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(this.cacheKey, key)
        );
        return cached;
    }

/**
* Writes data to the cache with a specified key.
* @param {string} key - The key to use when storing the data in the cache.
* @param {T} data - The data to store in the cache.
* @returns {Promise<void>}
*/
    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(this.cacheKey, key), data, {
            expires: Date.now() + 5 * 60 * 1000,
        });
    }

/**
 * Retrieves cached data either from in-memory cache or file-based cache.
 * @template T The data type to retrieve.
 * @param {string} key The key to retrieve the data for.
 * @returns {Promise<T | null>} The cached data if found, otherwise null.
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
 * Sets the cached data for a given cache key.
 * 
 * @param {string} cacheKey - The key under which the data is stored in the cache.
 * @param {T} data - The data to be cached.
 * @returns {Promise<void>} A promise that resolves when the data has been successfully cached.
 */
    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Set in-memory cache
        this.cache.set(cacheKey, data);

        // Write to file-based cache
        await this.writeToCache(cacheKey, data);
    }

/**
 * Fetches prices from a specified API endpoint with retries in case of failures
 * @returns {Promise<any>} The data retrieved from the API
 */
    private async fetchPricesWithRetry() {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const cellanaAptUsdcPoolAddr =
                    "0x234f0be57d6acfb2f0f19c17053617311a8d03c9ce358bdf9cd5c460e4a02b7c";
                const response = await fetch(
                    `https://api.dexscreener.com/latest/dex/pairs/aptos/${cellanaAptUsdcPoolAddr}`
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
 * Asynchronously fetches the portfolio value for the wallet.
 * @returns {Promise<WalletPortfolio>} The wallet portfolio value.
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
                console.error("Error fetching APT price:", error);
                throw error;
            });
            const aptAmountOnChain = await this.aptosClient
                .getAccountAPTAmount({
                    accountAddress: this.address,
                })
                .catch((error) => {
                    console.error("Error fetching APT amount:", error);
                    throw error;
                });

            const aptAmount = new BigNumber(aptAmountOnChain).div(
                new BigNumber(10).pow(APT_DECIMALS)
            );
            const totalUsd = new BigNumber(aptAmount).times(prices.apt.usd);

            const portfolio = {
                totalUsd: totalUsd.toString(),
                totalApt: aptAmount.toString(),
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
 * Asynchronously fetches prices, first attempting to retrieve cached data and falling back to live data if not available.
 * Returns a Promise that resolves to Prices object containing APT price in USD.
 * @returns {Promise<Prices>} The Prices object with APT price in USD
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

            const aptPriceData = await this.fetchPricesWithRetry().catch(
                (error) => {
                    console.error("Error fetching APT price:", error);
                    throw error;
                }
            );
            const prices: Prices = {
                apt: { usd: aptPriceData.pair.priceUsd },
            };
            this.setCachedData(cacheKey, prices);
            return prices;
        } catch (error) {
            console.error("Error fetching prices:", error);
            throw error;
        }
    }

/**
 * Formats the given wallet portfolio with the character name, wallet address, total value in USD and APT.
 * 
 * @param {Runtime} runtime - The runtime object containing character information.
 * @param {WalletPortfolio} portfolio - The portfolio object containing total USD and APT values.
 * @returns {string} Formatted output with character name, wallet address, total value in USD and APT.
 */
    formatPortfolio(runtime, portfolio: WalletPortfolio): string {
        let output = `${runtime.character.name}\n`;
        output += `Wallet Address: ${this.address}\n`;

        const totalUsdFormatted = new BigNumber(portfolio.totalUsd).toFixed(2);
        const totalAptFormatted = new BigNumber(portfolio.totalApt).toFixed(4);

        output += `Total Value: $${totalUsdFormatted} (${totalAptFormatted} APT)\n`;

        return output;
    }

/**
 * Asynchronously retrieves the portfolio value data and returns a formatted string representation of it.
 * 
 * @param {number} runtime - The runtime value used for formatting the portfolio data.
 * @returns {Promise<string>} A promise that resolves to the formatted portfolio value string.
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
        const privateKey = runtime.getSetting("APTOS_PRIVATE_KEY");
        const aptosAccount = Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(
                PrivateKey.formatPrivateKey(
                    privateKey,
                    PrivateKeyVariants.Ed25519
                )
            ),
        });
        const network = runtime.getSetting("APTOS_NETWORK") as Network;

        try {
            const aptosClient = new Aptos(
                new AptosConfig({
                    network,
                })
            );
            const provider = new WalletProvider(
                aptosClient,
                aptosAccount.accountAddress.toStringLong(),
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
