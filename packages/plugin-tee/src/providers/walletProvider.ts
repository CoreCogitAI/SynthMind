/* This is an example of how WalletProvider can use DeriveKeyProvider to generate a Solana Keypair */
import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import NodeCache from "node-cache";
import { DeriveKeyProvider } from "./deriveKeyProvider";
import { RemoteAttestationQuote } from "../types/tee";
// Provider configuration
const PROVIDER_CONFIG = {
    BIRDEYE_API: "https://public-api.birdeye.so",
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    DEFAULT_RPC: "https://api.mainnet-beta.solana.com",
    TOKEN_ADDRESSES: {
        SOL: "So11111111111111111111111111111111111111112",
        BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
        ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    },
};

/**
 * Interface representing an item with specific properties.
 * @typedef {Object} Item
 * @property {string} name - The name of the item.
 * @property {string} address - The address of the item.
 * @property {string} symbol - The symbol of the item.
 * @property {number} decimals - The decimals of the item.
 * @property {string} balance - The balance of the item.
 * @property {string} uiAmount - The UI amount of the item.
 * @property {string} priceUsd - The price in USD of the item.
 * @property {string} valueUsd - The value in USD of the item.
 * @property {string} [valueSol] - Optional value in Sol of the item.
 */
export interface Item {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    balance: string;
    uiAmount: string;
    priceUsd: string;
    valueUsd: string;
    valueSol?: string;
}

/**
 * Interface representing a wallet portfolio.
 * @typedef {Object} WalletPortfolio
 * @property {string} totalUsd - The total amount in USD.
 * @property {string} [totalSol] - The total amount in Sol (optional).
 * @property {Array<Item>} items - An array of items in the portfolio.
 */
interface WalletPortfolio {
    totalUsd: string;
    totalSol?: string;
    items: Array<Item>;
}

/**
 * Interface representing BirdEye price data.
 * @typedef {Object} _BirdEyePriceData
 * @property {Object.<string, { price: number, priceChange24h: number }>} data - The data object containing price information for different keys.
 */
interface _BirdEyePriceData {
    data: {
        [key: string]: {
            price: number;
            priceChange24h: number;
        };
    };
}

/**
 * Interface representing prices for different cryptocurrencies.
 * @typedef {Object} Prices
 * @property {Object} solana - Object containing the price of Solana in USD.
 * @property {string} solana.usd - Price of Solana in USD.
 * @property {Object} bitcoin - Object containing the price of Bitcoin in USD.
 * @property {string} bitcoin.usd - Price of Bitcoin in USD.
 * @property {Object} ethereum - Object containing the price of Ethereum in USD.
 * @property {string} ethereum.usd - Price of Ethereum in USD.
 */
interface Prices {
    solana: { usd: string };
    bitcoin: { usd: string };
    ethereum: { usd: string };
}

/**
 * Class representing a Wallet Provider.
 */

export class WalletProvider {
    private cache: NodeCache;

/**
 * Constructor for initializing a new instance.
 * 
 * @param {Connection} connection - The connection object.
 * @param {PublicKey} walletPublicKey - The public key of the wallet.
 */
    constructor(
        private connection: Connection,
        private walletPublicKey: PublicKey
    ) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
    }

/**
 * Fetches data from a given URL with retries in case of failure.
 * @param {any} runtime - The runtime object.
 * @param {string} url - The URL to fetch data from.
 * @param {RequestInit} [options={}] - The additional options for the fetch request.
 * @returns {Promise<any>} - A Promise that resolves with the fetched data.
 */
    private async fetchWithRetry(
        runtime,
        url: string,
        options: RequestInit = {}
    ): Promise<any> {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: "application/json",
                        "x-chain": "solana",
                        "X-API-KEY": apiKey || "",
                        ...options.headers,
                    },
                });

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
 * Fetches the portfolio value for a wallet.
 * 
 * @param {Runtime} runtime The runtime environment for the function.
 * @returns {Promise<WalletPortfolio>} A promise that resolves to the wallet portfolio.
 */
    async fetchPortfolioValue(runtime): Promise<WalletPortfolio> {
        try {
            const cacheKey = `portfolio-${this.walletPublicKey.toBase58()}`;
            const cachedValue = this.cache.get<WalletPortfolio>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPortfolioValue");
                return cachedValue;
            }
            console.log("Cache miss for fetchPortfolioValue");

            const walletData = await this.fetchWithRetry(
                runtime,
                `${PROVIDER_CONFIG.BIRDEYE_API}/v1/wallet/token_list?wallet=${this.walletPublicKey.toBase58()}`
            );

            if (!walletData?.success || !walletData?.data) {
                console.error("No portfolio data available", walletData);
                throw new Error("No portfolio data available");
            }

            const data = walletData.data;
            const totalUsd = new BigNumber(data.totalUsd.toString());
            const prices = await this.fetchPrices(runtime);
            const solPriceInUSD = new BigNumber(prices.solana.usd.toString());

            const items = data.items.map((item: any) => ({
                ...item,
                valueSol: new BigNumber(item.valueUsd || 0)
                    .div(solPriceInUSD)
                    .toFixed(6),
                name: item.name || "Unknown",
                symbol: item.symbol || "Unknown",
                priceUsd: item.priceUsd || "0",
                valueUsd: item.valueUsd || "0",
            }));

            const totalSol = totalUsd.div(solPriceInUSD);
            const portfolio = {
                totalUsd: totalUsd.toString(),
                totalSol: totalSol.toFixed(6),
                items: items.sort((a, b) =>
                    new BigNumber(b.valueUsd)
                        .minus(new BigNumber(a.valueUsd))
                        .toNumber()
                ),
            };
            this.cache.set(cacheKey, portfolio);
            return portfolio;
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            throw error;
        }
    }

/**
 * Fetches prices for SOL, BTC, and ETH from a provided runtime environment.
 * Utilizes caching to optimize performance by storing and retrieving prices.
 *
 * @param {any} runtime - The runtime environment to fetch prices from.
 * @returns {Promise<Prices>} - A Promise that resolves to an object containing prices for SOL, BTC, and ETH.
 */
```
    async fetchPrices(runtime): Promise<Prices> {
        try {
            const cacheKey = "prices";
            const cachedValue = this.cache.get<Prices>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPrices");
                return cachedValue;
            }
            console.log("Cache miss for fetchPrices");

            const { SOL, BTC, ETH } = PROVIDER_CONFIG.TOKEN_ADDRESSES;
            const tokens = [SOL, BTC, ETH];
            const prices: Prices = {
                solana: { usd: "0" },
                bitcoin: { usd: "0" },
                ethereum: { usd: "0" },
            };

            for (const token of tokens) {
                const response = await this.fetchWithRetry(
                    runtime,
                    `${PROVIDER_CONFIG.BIRDEYE_API}/defi/price?address=${token}`,
                    {
                        headers: {
                            "x-chain": "solana",
                        },
                    }
                );

                if (response?.data?.value) {
                    const price = response.data.value.toString();
                    prices[
                        token === SOL
                            ? "solana"
                            : token === BTC
                              ? "bitcoin"
                              : "ethereum"
                    ].usd = price;
                } else {
                    console.warn(`No price data available for token: ${token}`);
                }
            }

            this.cache.set(cacheKey, prices);
            return prices;
        } catch (error) {
            console.error("Error fetching prices:", error);
            throw error;
        }
    }

/**
 * Formats the portfolio information into a string for display.
 * 
 * @param {Runtime} runtime - The runtime object for the current environment.
 * @param {WalletPortfolio} portfolio - The wallet portfolio containing token balances.
 * @param {Prices} prices - The current market prices for various cryptocurrencies.
 * @returns {string} The formatted portfolio information as a string.
 */
    formatPortfolio(
        runtime,
        portfolio: WalletPortfolio,
        prices: Prices
    ): string {
        let output = `${runtime.character.description}\n`;
        output += `Wallet Address: ${this.walletPublicKey.toBase58()}\n\n`;

        const totalUsdFormatted = new BigNumber(portfolio.totalUsd).toFixed(2);
        const totalSolFormatted = portfolio.totalSol;

        output += `Total Value: $${totalUsdFormatted} (${totalSolFormatted} SOL)\n\n`;
        output += "Token Balances:\n";

        const nonZeroItems = portfolio.items.filter((item) =>
            new BigNumber(item.uiAmount).isGreaterThan(0)
        );

        if (nonZeroItems.length === 0) {
            output += "No tokens found with non-zero balance\n";
        } else {
            for (const item of nonZeroItems) {
                const valueUsd = new BigNumber(item.valueUsd).toFixed(2);
                output += `${item.name} (${item.symbol}): ${new BigNumber(
                    item.uiAmount
                ).toFixed(6)} ($${valueUsd} | ${item.valueSol} SOL)\n`;
            }
        }

        output += "\nMarket Prices:\n";
        output += `SOL: $${new BigNumber(prices.solana.usd).toFixed(2)}\n`;
        output += `BTC: $${new BigNumber(prices.bitcoin.usd).toFixed(2)}\n`;
        output += `ETH: $${new BigNumber(prices.ethereum.usd).toFixed(2)}\n`;

        return output;
    }

/**
 * Asynchronously fetches portfolio value and prices, then formats the portfolio into a string.
 * 
 * @param {any} runtime - The runtime environment for the function.
 * @returns {Promise<string>} A promise that resolves to a string representing the formatted portfolio.
 */
    async getFormattedPortfolio(runtime): Promise<string> {
        try {
            const [portfolio, prices] = await Promise.all([
                this.fetchPortfolioValue(runtime),
                this.fetchPrices(runtime),
            ]);

            return this.formatPortfolio(runtime, portfolio, prices);
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
    ): Promise<string> => {
        const agentId = runtime.agentId;
        const teeMode = runtime.getSetting("TEE_MODE");
        const deriveKeyProvider = new DeriveKeyProvider(teeMode);
        try {
            // Validate wallet configuration
            if (!runtime.getSetting("WALLET_SECRET_SALT")) {
                console.error(
                    "Wallet secret salt is not configured in settings"
                );
                return "";
            }

            let publicKey: PublicKey;
            try {
                const derivedKeyPair: {
                    keypair: Keypair;
                    attestation: RemoteAttestationQuote;
                } = await deriveKeyProvider.deriveEd25519Keypair(
                    "/",
                    runtime.getSetting("WALLET_SECRET_SALT"),
                    agentId
                );
                publicKey = derivedKeyPair.keypair.publicKey;
                console.log("Wallet Public Key: ", publicKey.toBase58());
            } catch (error) {
                console.error("Error creating PublicKey:", error);
                return "";
            }

            const connection = new Connection(PROVIDER_CONFIG.DEFAULT_RPC);
            const provider = new WalletProvider(connection, publicKey);

            const porfolio = await provider.getFormattedPortfolio(runtime);
            return porfolio;
        } catch (error) {
            console.error("Error in wallet provider:", error.message);
            return `Failed to fetch wallet information: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    },
};

// Module exports
export { walletProvider };
