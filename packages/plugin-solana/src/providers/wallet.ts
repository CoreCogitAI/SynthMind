import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import NodeCache from "node-cache";
import { getWalletKey } from "../keypairUtils";

// Provider configuration
const PROVIDER_CONFIG = {
    BIRDEYE_API: "https://public-api.birdeye.so",
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    DEFAULT_RPC: "https://api.mainnet-beta.solana.com",
    GRAPHQL_ENDPOINT: "https://graph.codex.io/graphql",
    TOKEN_ADDRESSES: {
        SOL: "So11111111111111111111111111111111111111112",
        BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
        ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    },
};

/**
 * Represents an item with the following properties:
 * - name: the name of the item
 * - address: the address of the item
 * - symbol: the symbol of the item
 * - decimals: the number of decimals for the item
 * - balance: the balance of the item
 * - uiAmount: the UI amount of the item
 * - priceUsd: the price of the item in USD
 * - valueUsd: the value of the item in USD
 * - valueSol (optional): the value of the item in Solana
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
 * @property {string} totalUsd - The total value in USD.
 * @property {string} [totalSol] - The total value in SOL (optional).
 * @property {Array<Item>} items - An array of items in the portfolio.
 */
interface WalletPortfolio {
    totalUsd: string;
    totalSol?: string;
    items: Array<Item>;
}

/**
 * Interface representing Bird Eye Price Data.
 * Contains data object with key-value pairs where key is a string and value is an object with price and priceChange24h properties.
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
 * Interface representing prices for various cryptocurrencies.
 * @property {object} solana - Price of Solana in USD
 * @property {string} solana.usd - Price of Solana in USD
 * @property {object} bitcoin - Price of Bitcoin in USD
 * @property {string} bitcoin.usd - Price of Bitcoin in USD
 * @property {object} ethereum - Price of Ethereum in USD
 * @property {string} ethereum.usd - Price of Ethereum in USD
 */
interface Prices {
    solana: { usd: string };
    bitcoin: { usd: string };
    ethereum: { usd: string };
}

/**
 * Represents a WalletProvider that interacts with the Birdeye API to fetch wallet information and portfolio values.
 */
 */
export class WalletProvider {
    private cache: NodeCache;

/**
 * Represents a WalletManager class that manages wallet data.
 * @constructor
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
 * Performs a fetch request with retries in case of failure.
 * 
 * @param {any} runtime - The runtime object.
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} options - The options for the fetch request.
 * @returns {Promise<any>} A promise that resolves with the fetched data.
 */
    private async fetchWithRetry(
        runtime,
        url: string,
        options: RequestInit = {}
    ): Promise<any> {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: "application/json",
                        "x-chain": "solana",
                        "X-API-KEY":
                            runtime.getSetting("BIRDEYE_API_KEY", "") || "",
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
 * Fetch the portfolio value for the wallet.
 * 
 * @param {any} runtime - The runtime object for the fetch.
 * @returns {Promise<WalletPortfolio>} - The fetched wallet portfolio.
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
 * Fetches the portfolio value of a wallet from Codex API.
 * 
 * @param {Runtime} runtime The runtime instance.
 * @returns {Promise<WalletPortfolio>} The portfolio value of the wallet.
 */
    async fetchPortfolioValueCodex(runtime): Promise<WalletPortfolio> {
        try {
            const cacheKey = `portfolio-${this.walletPublicKey.toBase58()}`;
            const cachedValue = await this.cache.get<WalletPortfolio>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPortfolioValue");
                return cachedValue;
            }
            console.log("Cache miss for fetchPortfolioValue");

            const query = `
              query Balances($walletId: String!, $cursor: String) {
                balances(input: { walletId: $walletId, cursor: $cursor }) {
                  cursor
                  items {
                    walletId
                    tokenId
                    balance
                    shiftedBalance
                  }
                }
              }
            `;

            const variables = {
                walletId: `${this.walletPublicKey.toBase58()}:${1399811149}`,
                cursor: null,
            };

            const response = await fetch(PROVIDER_CONFIG.GRAPHQL_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        runtime.getSetting("CODEX_API_KEY", "") || "",
                },
                body: JSON.stringify({
                    query,
                    variables,
                }),
            }).then((res) => res.json());

            const data = response.data?.data?.balances?.items;

            if (!data || data.length === 0) {
                console.error("No portfolio data available", data);
                throw new Error("No portfolio data available");
            }

            // Fetch token prices
            const prices = await this.fetchPrices(runtime);
            const solPriceInUSD = new BigNumber(prices.solana.usd.toString());

            // Reformat items
            const items: Item[] = data.map((item: any) => {
                return {
                    name: "Unknown",
                    address: item.tokenId.split(":")[0],
                    symbol: item.tokenId.split(":")[0],
                    decimals: 6,
                    balance: item.balance,
                    uiAmount: item.shiftedBalance.toString(),
                    priceUsd: "",
                    valueUsd: "",
                    valueSol: "",
                };
            });

            // Calculate total portfolio value
            const totalUsd = items.reduce(
                (sum, item) => sum.plus(new BigNumber(item.valueUsd)),
                new BigNumber(0)
            );

            const totalSol = totalUsd.div(solPriceInUSD);

            const portfolio: WalletPortfolio = {
                totalUsd: totalUsd.toFixed(6),
                totalSol: totalSol.toFixed(6),
                items: items.sort((a, b) =>
                    new BigNumber(b.valueUsd)
                        .minus(new BigNumber(a.valueUsd))
                        .toNumber()
                ),
            };

            // Cache the portfolio for future requests
            await this.cache.set(cacheKey, portfolio, 60 * 1000); // Cache for 1 minute

            return portfolio;
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            throw error;
        }
    }

/**
 * Asynchronously fetches prices for SOL, BTC, and ETH using Birdeye API with specified token addresses.
 * Checks if the prices are already cached and returns them if found.
 * If not cached, makes API calls for each token, retrieves and stores the prices in cache.
 * 
 * @param {any} runtime - The runtime environment for making API requests.
 * @returns {Promise<Prices>} - A Promise that resolves to an object containing the prices of SOL, BTC, and ETH.
 * @throws {Error} - If there is an error fetching prices from the API.
 */
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
 * @param {any} runtime - The runtime object.
 * @param {WalletPortfolio} portfolio - The portfolio object containing wallet information.
 * @param {Prices} prices - The prices object containing market prices.
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
 * Asynchronously retrieves the portfolio value, prices, and formats the portfolio based on the provided runtime.
 * 
 * @param {any} runtime - The runtime environment for the portfolio retrieval and formatting.
 * @returns {Promise<string>} A Promise that resolves with a formatted portfolio report, or a string indicating an error message.
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
    ): Promise<string | null> => {
        try {
            const { publicKey } = await getWalletKey(runtime, false);

            const connection = new Connection(
                runtime.getSetting("RPC_URL") || PROVIDER_CONFIG.DEFAULT_RPC
            );

            const provider = new WalletProvider(connection, publicKey);

            return await provider.getFormattedPortfolio(runtime);
        } catch (error) {
            console.error("Error in wallet provider:", error);
            return null;
        }
    },
};

// Module exports
export { walletProvider };
