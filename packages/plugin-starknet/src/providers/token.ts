// THIS IS INCOMPLETE
// Look for the TODOs to see what needs to be updated

import { settings } from "@elizaos/core";
import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import {
    DexScreenerData,
    DexScreenerPair,
    HolderData,
    ProcessedTokenData,
    TokenSecurityData,
    CalculatedBuyAmounts,
    Prices,
} from "../types/trustDB.ts";
import { WalletProvider, Item } from "./walletProvider.ts";
import { num } from "starknet";
import {
    analyzeHighSupplyHolders,
    evaluateTokenTrading,
    TokenMetrics,
} from "./utils.ts";
import { PROVIDER_CONFIG } from "../index.ts";
import { Cache } from "../utils/cache.ts";
import { TokenInfo } from "../types/token.ts";

export const PORTFOLIO_TOKENS = {
    // Coingecko IDs src:
    // https://api.coingecko.com/api/v3/coins/list
    // https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit?gid=0#gid=0

    BROTHER: {
        address:
            "0x3b405a98c9e795d427fe82cdeeeed803f221b52471e3a757574a2b4180793ee",
        coingeckoId: "starknet-brother",
        decimals: 18,
    },
    CASH: {
        address:
            "0x0498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada",
        coingeckoId: "opus-cash",
        decimals: 18,
    },
    ETH: {
        address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        coingeckoId: "ethereum",
        decimals: 18,
    },
    LORDS: {
        address:
            "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
        coingeckoId: "lords",
        decimals: 18,
    },
    STRK: {
        address:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        coingeckoId: "starknet",
        decimals: 18,
    },
    USDC: {
        address:
            "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        coingeckoId: "usd-coin",
        decimals: 6,
    },
    USDT: {
        address:
            "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
        coingeckoId: "tether",
        decimals: 6,
    },
    WBTC: {
        address:
            "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
        coingeckoId: "bitcoin",
        decimals: 8,
    },
};

/**
 * Class representing a Token Provider.
export class TokenProvider {
    private cache: Cache;

/**
 * Constructor for creating a new instance of the class.
 * @param {string} tokenAddress - The address of the token.
 * @param {WalletProvider} walletProvider - The wallet provider for interacting with wallets.
 */
    constructor(
        private tokenAddress: string,
        private walletProvider: WalletProvider
    ) {
        this.cache = new Cache();
    }

    // TODO: remove this
/**
 * Asynchronously fetches data from a specified URL with configurable options and retries in case of failure.
 * @template T
 * @param {string} url - The URL to fetch data from.
 * @param {RequestInit} [options={}] - Additional options for the fetch request.
 * @returns {Promise<T>} - A promise that resolves to the fetched data.
 */
    private async fetchWithRetry<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        "Content-Type": "application/json",
                        ...options.headers,
                    },
                });

                if (!response.ok) {
                    throw new Error(
                        `HTTP error! status: ${
                            response.status
                        }, message: ${await response.text()}`
                    );
                }

                return await response.json();
            } catch (error) {
                console.error(`Request attempt ${i + 1} failed:`, error);
                lastError = error as Error;

                if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
                    const delay = PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    // TODO: Update to Starknet
/**
 * Retrieves the tokens in the wallet associated with the provided runtime.
 * 
 * @param {IAgentRuntime} runtime - The runtime context to fetch token information from.
 * @returns {Promise<Item[]>} A promise that resolves with an array of items representing the tokens in the wallet.
 */
    async getTokensInWallet(runtime: IAgentRuntime): Promise<Item[]> {
        const walletInfo =
            await this.walletProvider.fetchPortfolioValue(runtime);
        const items = walletInfo.items;
        return items;
    }

    // check if the token symbol is in the wallet
/**
 * Asynchronously retrieves the address of a token from the wallet based on the token symbol.
 * 
 * @param {IAgentRuntime} runtime - The runtime object used for retrieving tokens from the wallet.
 * @param {string} tokenSymbol - The symbol of the token to retrieve the address for.
 * @returns {Promise<string | null>} The address of the token if it exists in the wallet, otherwise null.
 */
    async getTokenFromWallet(runtime: IAgentRuntime, tokenSymbol: string) {
        try {
            const items = await this.getTokensInWallet(runtime);
            const token = items.find((item) => item.symbol === tokenSymbol);

            if (token) {
                return token.address;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error checking token in wallet:", error);
            return null;
        }
    }

/**
 * Fetches current prices of various tokens using external APIs.
 * If data is available in cache, returns cached prices.
 * @returns {Promise<Prices>} Promise containing updated prices object
 */
    async fetchPrices(): Promise<Prices> {
        try {
            const cacheKey = "prices";
            const cachedData = this.cache.getCachedData<Prices>(cacheKey);
            if (cachedData) {
                console.log("Returning cached prices.");
                return cachedData;
            }

            const { BTC, ETH, STRK } = PROVIDER_CONFIG.TOKEN_ADDRESSES;
            const tokens = [BTC, ETH, STRK];
            const prices: Prices = {
                starknet: { usd: "0" },
                bitcoin: { usd: "0" },
                ethereum: { usd: "0" },
            };

            const tokenResponses = await Promise.all(
                tokens.map((token) =>
                    fetch(`${PROVIDER_CONFIG.AVNU_API}/tokens/${token}`, {
                        method: "GET",
                        headers: {},
                    }).then((res) => res.json())
                )
            );

            tokenResponses.forEach((tokenInfo: TokenInfo, index) => {
                if (!tokenInfo.market) {
                    console.warn(
                        `No price data available for token: ${tokens[index]}`
                    );
                    return;
                }

                const token = tokens[index];
                const priceKey =
                    token === STRK
                        ? "starknet"
                        : token === BTC
                          ? "bitcoin"
                          : "ethereum";

                prices[priceKey].usd = tokenInfo.market.currentPrice.toString();
            });

            this.cache.setCachedData(cacheKey, prices);
            return prices;
        } catch (error) {
            console.error("Error fetching prices:", error);
            throw error;
        }
    }

/**
 * Asynchronously calculates the buy amounts in USD and STRK based on the liquidity and market cap data fetched from dexScreenerData and prices.
 * @returns {Promise<CalculatedBuyAmounts>} The calculated buy amounts with categories none, low, medium, and high in both USD and STRK.
 */
    async calculateBuyAmounts(): Promise<CalculatedBuyAmounts> {
        const dexScreenerData = await this.fetchDexScreenerData();
        const prices = await this.fetchPrices();
        const starknetPrice = num.toBigInt(prices.starknet.usd);

        if (!dexScreenerData || dexScreenerData.pairs.length === 0) {
            return { none: 0, low: 0, medium: 0, high: 0 };
        }

        // Get the first pair
        const pair = dexScreenerData.pairs[0];
        const { liquidity, marketCap } = pair;
        if (!liquidity || !marketCap) {
            return { none: 0, low: 0, medium: 0, high: 0 };
        }

        if (liquidity.usd === 0) {
            return { none: 0, low: 0, medium: 0, high: 0 };
        }
        if (marketCap < 100000) {
            return { none: 0, low: 0, medium: 0, high: 0 };
        }

        // impact percentages based on liquidity
        const impactPercentages = {
            LOW: 0.01, // 1% of liquidity
            MEDIUM: 0.05, // 5% of liquidity
            HIGH: 0.1, // 10% of liquidity
        };

        // Calculate buy amounts in USD
        const lowBuyAmountUSD = liquidity.usd * impactPercentages.LOW;
        const mediumBuyAmountUSD = liquidity.usd * impactPercentages.MEDIUM;
        const highBuyAmountUSD = liquidity.usd * impactPercentages.HIGH;

        // Convert each buy amount to STRK
        const lowBuyAmountSTRK = num.toBigInt(lowBuyAmountUSD) / starknetPrice;
        const mediumBuyAmountSTRK =
            num.toBigInt(mediumBuyAmountUSD) / starknetPrice;
        const highBuyAmountSTRK =
            num.toBigInt(highBuyAmountUSD) / starknetPrice;

        return {
            none: 0,
            low: Number(lowBuyAmountSTRK),
            medium: Number(mediumBuyAmountSTRK),
            high: Number(highBuyAmountSTRK),
        };
    }

    // TODO: Update to Starknet
/**
 * Asynchronously fetches token security data for a specific token address.
 * 
 * @returns {Promise<TokenSecurityData>} The token security data for the token address.
 */
    async fetchTokenSecurity(): Promise<TokenSecurityData> {
        const cacheKey = `tokenSecurity_${this.tokenAddress}`;
        const cachedData =
            this.cache.getCachedData<TokenSecurityData>(cacheKey);
        if (cachedData) {
            console.log(
                `Returning cached token security data for ${this.tokenAddress}.`
            );
            return cachedData;
        }
        // const url = `${PROVIDER_CONFIG.AVNU_API}${PROVIDER_CONFIG.TOKEN_SECURITY_ENDPOINT}${this.tokenAddress}`;
        // const data = await this.fetchWithRetry(url);

        // if (!data?.success || !data?.data) {
        //     throw new Error("No token security data available");
        // }

        // TODO: Update to Starknet
        const security: TokenSecurityData = {
            ownerBalance: "0",
            creatorBalance: "0",
            ownerPercentage: 0,
            creatorPercentage: 0,
            top10HolderBalance: "0",
            top10HolderPercent: 0,
        };
        this.cache.setCachedData(cacheKey, security);
        console.log(`Token security data cached for ${this.tokenAddress}.`);

        return security;
    }

    // TODO: Update to Starknet
/**
 * Fetches token trade data from an external API or cache.
 * 
 * @returns {Promise<TokenInfo>} The token trade data.
 */
    async fetchTokenTradeData(): Promise<TokenInfo> {
        const cacheKey = `tokenTradeData_${this.tokenAddress}`;
        const cachedData = this.cache.getCachedData<TokenInfo>(cacheKey);
        if (cachedData) {
            console.log(
                `Returning cached token trade data for ${this.tokenAddress}.`
            );
            return cachedData;
        }

        try {
            const response = await fetch(
                `${PROVIDER_CONFIG.AVNU_API}/tokens/${this.tokenAddress}`,
                {
                    method: "GET",
                    headers: {},
                }
            );

            const data = await response.json();

            if (!data?.success || !data?.data) {
                throw new Error("No token trade data available");
            }

            const tradeData: TokenInfo = {
                name: data.data.name,
                symbol: data.data.symbol,
                address: data.data.address,
                logoUri: data.data.logoUri,
                coingeckoId: data.data.coingeckoId,
                verified: data.data.verified,
                market: {
                    currentPrice: data.data.market.currentPrice,
                    marketCap: data.data.market.marketCap,
                    fullyDilutedValuation:
                        data.data.market.fullyDilutedValuation,
                    starknetTvl: data.data.market.starknetTvl,
                    priceChange1h: data.data.market.priceChange1h,
                    priceChangePercentage1h:
                        data.data.market.priceChangePercentage1h,
                    priceChange24h: data.data.market.priceChange24h,
                    priceChangePercentage24h:
                        data.data.market.priceChangePercentage24h,
                    priceChange7d: data.data.market.priceChange7d,
                    priceChangePercentage7d:
                        data.data.market.priceChangePercentage7d,
                    marketCapChange24h: data.data.market.marketCapChange24h,
                    marketCapChangePercentage24h:
                        data.data.market.marketCapChangePercentage24h,
                    starknetVolume24h: data.data.market.starknetVolume24h,
                    starknetTradingVolume24h:
                        data.data.market.starknetTradingVolume24h,
                },
                tags: data.data.tags,
            };

            this.cache.setCachedData(cacheKey, tradeData);
            return tradeData;
        } catch (error) {
            console.error("Error fetching token trade data:", error);
            throw error;
        }
    }

/**
 * Asynchronously fetches DexScreener data for the specified token address.
 * If the data is available in cache, returns the cached data.
 * If not, makes a fetch call to the DexScreener API to retrieve the data,
 * then caches the data and returns it.
 * If an error occurs during the retrieval process, logs the error and returns a default data object.
 * @return {Promise<DexScreenerData>} A promise that resolves to the fetched DexScreener data.
 */
    async fetchDexScreenerData(): Promise<DexScreenerData> {
        const cacheKey = `dexScreenerData_${this.tokenAddress}`;
        const cachedData = this.cache.getCachedData<DexScreenerData>(cacheKey);
        if (cachedData) {
            console.log("Returning cached DexScreener data.");
            return cachedData;
        }

        const url = `https://api.dexscreener.com/latest/dex/search?q=${this.tokenAddress}`;
        try {
            console.log(
                `Fetching DexScreener data for token: ${this.tokenAddress}`
            );
            const data = await fetch(url)
                .then((res) => res.json())
                .catch((err) => {
                    console.error(err);
                });

            if (!data || !data.pairs) {
                throw new Error("No DexScreener data available");
            }

            const dexData: DexScreenerData = {
                schemaVersion: data.schemaVersion,
                pairs: data.pairs,
            };

            // Cache the result
            this.cache.setCachedData(cacheKey, dexData);

            return dexData;
        } catch (error) {
            console.error(`Error fetching DexScreener data:`, error);
            return {
                schemaVersion: "1.0.0",
                pairs: [],
            };
        }
    }

/**
 * Retrieves DexScreener data for a specific symbol.
 * If data is cached, returns the pair with the highest liquidity.
 * If data is not cached, fetches new data from the DexScreener API.
 * Caches the fetched data for future retrieval.
 * @param {string} symbol - The symbol to search for in DexScreener.
 * @returns {Promise<DexScreenerPair | null>} The pair with the highest liquidity or null if no data is found.
 */
    async searchDexScreenerData(
        symbol: string
    ): Promise<DexScreenerPair | null> {
        const cacheKey = `dexScreenerData_search_${symbol}`;
        const cachedData = this.cache.getCachedData<DexScreenerData>(cacheKey);
        if (cachedData) {
            console.log("Returning cached search DexScreener data.");
            return this.getHighestLiquidityPair(cachedData);
        }

        const url = `https://api.dexscreener.com/latest/dex/search?q=${symbol}`;
        try {
            console.log(`Fetching DexScreener data for symbol: ${symbol}`);
            const data = await fetch(url)
                .then((res) => res.json())
                .catch((err) => {
                    console.error(err);
                    return null;
                });

            if (!data || !data.pairs || data.pairs.length === 0) {
                throw new Error("No DexScreener data available");
            }

            const dexData: DexScreenerData = {
                schemaVersion: data.schemaVersion,
                pairs: data.pairs,
            };

            // Cache the result
            this.cache.setCachedData(cacheKey, dexData);

            // Return the pair with the highest liquidity and market cap
            return this.getHighestLiquidityPair(dexData);
        } catch (error) {
            console.error(`Error fetching DexScreener data:`, error);
            return null;
        }
    }

/**
 * Retrieve the pair with the highest liquidity and market cap from the given DexScreenerData.
 * If no pairs are available, return null.
 * @param {DexScreenerData} dexData - The DexScreenerData object containing pairs to search through.
 * @returns {DexScreenerPair | null} The pair with the highest liquidity and market cap, or null if no pairs are available.
 */
    getHighestLiquidityPair(dexData: DexScreenerData): DexScreenerPair | null {
        if (dexData.pairs.length === 0) {
            return null;
        }

        // Sort pairs by both liquidity and market cap to get the highest one
        return dexData.pairs.sort((a, b) => {
            const liquidityDiff = b.liquidity.usd - a.liquidity.usd;
            if (liquidityDiff !== 0) {
                return liquidityDiff; // Higher liquidity comes first
            }
            return b.marketCap - a.marketCap; // If liquidity is equal, higher market cap comes first
        })[0];
    }

    // TODO:
/**
 * Analyze holder distribution based on the provided trade data.
 * @param {TokenInfo} _tradeData - Information about the token trade.
 * @returns {Promise<string>} The status of the holder distribution (increasing, decreasing, stable).
 */
    async analyzeHolderDistribution(_tradeData: TokenInfo): Promise<string> {
        // Define the time intervals to consider (e.g., 30m, 1h, 2h)

        // TODO: Update to Starknet
        const intervals = [
            {
                period: "30m",
                change: 0,
            },
            { period: "1h", change: 0 },
            { period: "2h", change: 0 },
            { period: "4h", change: 0 },
            { period: "8h", change: 0 },
            {
                period: "24h",
                change: 0,
            },
        ];

        // Calculate the average change percentage
        const validChanges = intervals
            .map((interval) => interval.change)
            .filter(
                (change) => change !== null && change !== undefined
            ) as number[];

        if (validChanges.length === 0) {
            return "stable";
        }

        const averageChange =
            validChanges.reduce((acc, curr) => acc + curr, 0) /
            validChanges.length;

        const increaseThreshold = 10; // e.g., average change > 10%
        const decreaseThreshold = -10; // e.g., average change < -10%

        if (averageChange > increaseThreshold) {
            return "increasing";
        } else if (averageChange < decreaseThreshold) {
            return "decreasing";
        } else {
            return "stable";
        }
    }

    // TODO: Update to Starknet
/**
 * Fetches the list of holders for the specified token address.
 * If the data is already cached, returns the cached data.
 * Otherwise, makes API calls to retrieve the holder list.
 * @returns {Promise<HolderData[]>} The list of holders with their addresses and balances.
 */
    async fetchHolderList(): Promise<HolderData[]> {
        const cacheKey = `holderList_${this.tokenAddress}`;
        const cachedData = this.cache.getCachedData<HolderData[]>(cacheKey);
        if (cachedData) {
            console.log("Returning cached holder list.");
            return cachedData;
        }

        const allHoldersMap = new Map<string, number>();
        let page = 1;
        const limit = 1000;
        let cursor;
        //HELIOUS_API_KEY needs to be added
        const url = `https://mainnet.helius-rpc.com/?api-key=${
            settings.HELIUS_API_KEY || ""
        }`;
        console.log({ url });

        try {
            while (true) {
                const params = {
                    limit: limit,
                    displayOptions: {},
                    mint: this.tokenAddress,
                    cursor: cursor,
                };
                if (cursor != undefined) {
                    params.cursor = cursor;
                }
                console.log(`Fetching holders - Page ${page}`);
                if (page > 2) {
                    break;
                }
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: "helius-test",
                        method: "getTokenAccounts",
                        params: params,
                    }),
                });

                const data = await response.json();

                if (
                    !data ||
                    !data.result ||
                    !data.result.token_accounts ||
                    data.result.token_accounts.length === 0
                ) {
                    console.log(
                        `No more holders found. Total pages fetched: ${
                            page - 1
                        }`
                    );
                    break;
                }

                console.log(
                    `Processing ${data.result.token_accounts.length} holders from page ${page}`
                );

                data.result.token_accounts.forEach((account: any) => {
                    const owner = account.owner;
                    const balance = parseFloat(account.amount);

                    if (allHoldersMap.has(owner)) {
                        allHoldersMap.set(
                            owner,
                            allHoldersMap.get(owner)! + balance
                        );
                    } else {
                        allHoldersMap.set(owner, balance);
                    }
                });
                cursor = data.result.cursor;
                page++;
            }

            const holders: HolderData[] = Array.from(
                allHoldersMap.entries()
            ).map(([address, balance]) => ({
                address,
                balance: balance.toString(),
            }));

            console.log(`Total unique holders fetched: ${holders.length}`);

            // Cache the result
            this.cache.setCachedData(cacheKey, holders);

            return holders;
        } catch (error) {
            console.error("Error fetching holder list from Helius:", error);
            throw new Error("Failed to fetch holder list from Helius.");
        }
    }

/**
 * Filter high value holders based on the token price.
 * 
 * @param {TokenInfo} tradeData - The token information.
 * @returns {Promise<Array<{ holderAddress: string; balanceUsd: string }>>} The array of high value holders with their address and balance in USD.
 */ 
    async filterHighValueHolders(
        tradeData: TokenInfo
    ): Promise<Array<{ holderAddress: string; balanceUsd: string }>> {
        const holdersData = await this.fetchHolderList();

        const tokenPriceUsd = num.toBigInt(tradeData.market.currentPrice);

        const highValueHolders = holdersData
            .filter((holder) => {
                const balanceUsd = num.toBigInt(holder.balance) * tokenPriceUsd;
                return balanceUsd > 5;
            })
            .map((holder) => ({
                holderAddress: holder.address,
                balanceUsd: (
                    num.toBigInt(holder.balance) * tokenPriceUsd
                ).toString(),
            }));

        return highValueHolders;
    }

/**
 * Check if there have been recent trades based on the provided 24-hour trading volume.
 * 
 * @param {bigint} volume24hUsd - The 24-hour trading volume in USD to check
 * @returns {Promise<boolean>} - A Promise that resolves to true if there have been recent trades, false otherwise
 */  
    async checkRecentTrades(volume24hUsd: bigint): Promise<boolean> {
        return volume24hUsd > 0;
    }

/**
 * Asynchronously counts the number of high supply holders based on the given TokenSecurityData.
 * 
 * @param {TokenSecurityData} securityData - The security data of the token.
 * @returns {Promise<number>} The number of high supply holders.
 */
    async countHighSupplyHolders(
        securityData: TokenSecurityData
    ): Promise<number> {
        try {
            const holders = await this.fetchHolderList();
            const result = analyzeHighSupplyHolders({
                holders,
                ownerBalance: securityData.ownerBalance,
                creatorBalance: securityData.creatorBalance,
            });

            return result.count;
        } catch (error) {
            console.error("Error counting high supply holders:", error);
            return 0;
        }
    }

/**
 * Asynchronously fetches and processes token data including security, trade, DexScreener, holder distribution, high-value holders, recent trades,
 * high-supply holders count, DexScreener listing status, and paid status.
 * 
 * @returns {Promise<ProcessedTokenData>} The processed token data containing security, trade data, holder distribution trend, high value holders, recent trades,
 * high supply holders count, DexScreener data, DexScreener listing status, and paid status.
 * @throws {Error} If an error occurs during processing token data.
 */
    async getProcessedTokenData(): Promise<ProcessedTokenData> {
        try {
            console.log(
                `Fetching security data for token: ${this.tokenAddress}`
            );
            const security = await this.fetchTokenSecurity();

            console.log(`Fetching trade data for token: ${this.tokenAddress}`);
            const tradeData = await this.fetchTokenTradeData();

            console.log(
                `Fetching DexScreener data for token: ${this.tokenAddress}`
            );
            const dexData = await this.fetchDexScreenerData();

            console.log(
                `Analyzing holder distribution for token: ${this.tokenAddress}`
            );
            const holderDistributionTrend =
                await this.analyzeHolderDistribution(tradeData);

            console.log(
                `Filtering high-value holders for token: ${this.tokenAddress}`
            );
            const highValueHolders =
                await this.filterHighValueHolders(tradeData);

            console.log(
                `Checking recent trades for token: ${this.tokenAddress}`
            );
            const recentTrades = await this.checkRecentTrades(
                num.toBigInt(tradeData.market.starknetTradingVolume24h)
            );

            console.log(
                `Counting high-supply holders for token: ${this.tokenAddress}`
            );
            const highSupplyHoldersCount =
                await this.countHighSupplyHolders(security);

            console.log(
                `Determining DexScreener listing status for token: ${this.tokenAddress}`
            );
            const isDexScreenerListed = dexData.pairs.length > 0;
            const isDexScreenerPaid = dexData.pairs.some(
                (pair) => pair.boosts && pair.boosts.active > 0
            );

            const processedData: ProcessedTokenData = {
                security,
                tradeData,
                holderDistributionTrend,
                highValueHolders,
                recentTrades,
                highSupplyHoldersCount,
                dexScreenerData: dexData,
                isDexScreenerListed,
                isDexScreenerPaid,
            };

            // console.log("Processed token data:", processedData);
            return processedData;
        } catch (error) {
            console.error("Error processing token data:", error);
            throw error;
        }
    }

/**
 * Asynchronously determines whether the token should be traded based on various metrics.
 * 
 * @returns A Promise that resolves to a boolean value indicating whether the token should be traded.
 */
    async shouldTradeToken(): Promise<boolean> {
        try {
            const tokenData = await this.getProcessedTokenData();
            const { tradeData, security, dexScreenerData } = tokenData;
            const { ownerBalance, creatorBalance } = security;
            const { liquidity, marketCap } = dexScreenerData.pairs[0];

            const totalSupply =
                num.toBigInt(ownerBalance) + num.toBigInt(creatorBalance);

            const metrics: TokenMetrics = {
                liquidityUsd: num.toBigInt(liquidity.usd),
                marketCapUsd: num.toBigInt(marketCap),
                totalSupply,
                ownerPercentage:
                    Number(num.toBigInt(ownerBalance)) / Number(totalSupply),
                creatorPercentage:
                    Number(num.toBigInt(creatorBalance)) / Number(totalSupply),
                top10HolderPercent:
                    Number(
                        num.toBigInt(tradeData.market.starknetTradingVolume24h)
                    ) / Number(totalSupply),
                priceChange24hPercent: Number(
                    num.toBigInt(tradeData.market.priceChange24h)
                ),
                // TODO: Update to Starknet
                priceChange12hPercent: Number(
                    num.toBigInt(tradeData.market.priceChange24h)
                ),
                // TODO: Update to Starknet
                uniqueWallet24h: 0,
                volume24hUsd: num.toBigInt(
                    tradeData.market.starknetTradingVolume24h
                ),
            };

            const { shouldTrade } = evaluateTokenTrading(metrics);
            return shouldTrade;
        } catch (error) {
            console.error("Error processing token data:", error);
            throw error;
        }
    }

/**
 * Formats the token data into a string with various sections including Security Data, 
 * Trade Data, Holder Distribution Trend, High-Value Holders, Recent Trades, High-Supply Holders, 
 * and DexScreener Status. 
 * 
 * @param {ProcessedTokenData} data - The processed token data to be formatted
 * @returns {string} - The formatted token data as a string
 */
    formatTokenData(data: ProcessedTokenData): string {
        let output = `**Token Security and Trade Report**\n`;
        output += `Token Address: ${this.tokenAddress}\n\n`;

        // Security Data
        output += `**Ownership Distribution:**\n`;
        output += `- Owner Balance: ${data.security.ownerBalance}\n`;
        output += `- Creator Balance: ${data.security.creatorBalance}\n`;
        output += `- Owner Percentage: ${data.security.ownerPercentage}%\n`;
        output += `- Creator Percentage: ${data.security.creatorPercentage}%\n`;
        output += `- Top 10 Holders Balance: ${data.security.top10HolderBalance}\n`;
        output += `- Top 10 Holders Percentage: ${data.security.top10HolderPercent}%\n\n`;

        // Trade Data
        output += `**Trade Data:**\n`;
        // output += `- Holders: ${data.tradeData.holder}\n`;
        // output += `- Unique Wallets (24h): ${data.tradeData.holders}\n`;
        output += `- Price Change (24h): ${data.tradeData.market.priceChange24h}%\n`;
        // output += `- Price Change (12h): ${data.tradeData.market.priceChange12h}%\n`;
        output += `- Volume (24h USD): $${num
            .toBigInt(data.tradeData.market.starknetTradingVolume24h)
            .toString()}\n`;
        output += `- Current Price: $${num
            .toBigInt(data.tradeData.market.currentPrice)
            .toString()}\n\n`;

        // Holder Distribution Trend
        output += `**Holder Distribution Trend:** ${data.holderDistributionTrend}\n\n`;

        // High-Value Holders
        output += `**High-Value Holders (>$5 USD):**\n`;
        if (data.highValueHolders.length === 0) {
            output += `- No high-value holders found or data not available.\n`;
        } else {
            data.highValueHolders.forEach((holder) => {
                output += `- ${holder.holderAddress}: $${holder.balanceUsd}\n`;
            });
        }
        output += `\n`;

        // Recent Trades
        output += `**Recent Trades (Last 24h):** ${
            data.recentTrades ? "Yes" : "No"
        }\n\n`;

        // High-Supply Holders
        output += `**Holders with >2% Supply:** ${data.highSupplyHoldersCount}\n\n`;

        // DexScreener Status
        output += `**DexScreener Listing:** ${
            data.isDexScreenerListed ? "Yes" : "No"
        }\n`;
        if (data.isDexScreenerListed) {
            output += `- Listing Type: ${
                data.isDexScreenerPaid ? "Paid" : "Free"
            }\n`;
            output += `- Number of DexPairs: ${data.dexScreenerData.pairs.length}\n\n`;
            output += `**DexScreener Pairs:**\n`;
            data.dexScreenerData.pairs.forEach((pair, index) => {
                output += `\n**Pair ${index + 1}:**\n`;
                output += `- DEX: ${pair.dexId}\n`;
                output += `- URL: ${pair.url}\n`;
                output += `- Price USD: $${num
                    .toBigInt(pair.priceUsd)
                    .toString()}\n`;
                output += `- Volume (24h USD): $${num
                    .toBigInt(pair.volume.h24)
                    .toString()}\n`;
                output += `- Boosts Active: ${
                    pair.boosts && pair.boosts.active
                }\n`;
                output += `- Liquidity USD: $${num
                    .toBigInt(pair.liquidity.usd)
                    .toString()}\n`;
            });
        }
        output += `\n`;

        console.log("Formatted token data:", output);
        return output;
    }

/**
 * Async function to generate a formatted token report.
 * 
 * @returns {Promise<string>} The formatted token report as a string.
 */
    async getFormattedTokenReport(): Promise<string> {
        try {
            console.log("Generating formatted token report...");
            const processedData = await this.getProcessedTokenData();
            return this.formatTokenData(processedData);
        } catch (error) {
            console.error("Error generating token report:", error);
            return "Unable to fetch token information. Please try again later.";
        }
    }
}

// TODO: Check

const tokenProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State,
        tokenAddress?: string
    ): Promise<string> => {
        try {
            const walletProvider = new WalletProvider(runtime);
            const provider = new TokenProvider(tokenAddress, walletProvider);

            return provider.getFormattedTokenReport();
        } catch (error) {
            console.error("Error fetching token data:", error);
            return "Unable to fetch token information. Please try again later.";
        }
    },
};

export { tokenProvider };
