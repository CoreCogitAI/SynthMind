import { TokenInfo } from "./token";

/**
 * Interface representing security data for a token.
 * @typedef {Object} TokenSecurityData
 * @property {string} ownerBalance - The balance of the token owner.
 * @property {string} creatorBalance - The balance of the token creator.
 * @property {number} ownerPercentage - The percentage of the token owned by the owner.
 * @property {number} creatorPercentage - The percentage of the token owned by the creator.
 * @property {string} top10HolderBalance - The balance of the top 10 token holders.
 * @property {number} top10HolderPercent - The percentage of the token held by the top 10 token holders.
 */
export interface TokenSecurityData {
    ownerBalance: string;
    creatorBalance: string;
    ownerPercentage: number;
    creatorPercentage: number;
    top10HolderBalance: string;
    top10HolderPercent: number;
}

/**
 * Interface representing token trade data.
 *
 * @typedef {object} TokenTradeData
 * @property {string} address - The address of the token.
 * @property {number} holder - Number of holders.
 * @property {number} market - Market number.
 * @property {number} last_trade_unix_time - Unix timestamp of the last trade.
 * @property {string} last_trade_human_time - Human-readable timestamp of the last trade.
 * @property {number} price - Price of the token.
 * @property {number} history_30m_price - Price history over the last 30 minutes.
 * @property {number} price_change_30m_percent - Price change percentage over the last 30 minutes.
 * @property {number} history_1h_price - Price history over the last 1 hour.
 * @property {number} price_change_1h_percent - Price change percentage over the last 1 hour.
 * ...
 */
export interface TokenTradeData {
    address: string;
    holder: number;
    market: number;
    last_trade_unix_time: number;
    last_trade_human_time: string;
    price: number;
    history_30m_price: number;
    price_change_30m_percent: number;
    history_1h_price: number;
    price_change_1h_percent: number;
    history_2h_price: number;
    price_change_2h_percent: number;
    history_4h_price: number;
    price_change_4h_percent: number;
    history_6h_price: number;
    price_change_6h_percent: number;
    history_8h_price: number;
    price_change_8h_percent: number;
    history_12h_price: number;
    price_change_12h_percent: number;
    history_24h_price: number;
    price_change_24h_percent: number;
    unique_wallet_30m: number;
    unique_wallet_history_30m: number;
    unique_wallet_30m_change_percent: number;
    unique_wallet_1h: number;
    unique_wallet_history_1h: number;
    unique_wallet_1h_change_percent: number;
    unique_wallet_2h: number;
    unique_wallet_history_2h: number;
    unique_wallet_2h_change_percent: number;
    unique_wallet_4h: number;
    unique_wallet_history_4h: number;
    unique_wallet_4h_change_percent: number;
    unique_wallet_8h: number;
    unique_wallet_history_8h: number | null;
    unique_wallet_8h_change_percent: number | null;
    unique_wallet_24h: number;
    unique_wallet_history_24h: number | null;
    unique_wallet_24h_change_percent: number | null;
    trade_30m: number;
    trade_history_30m: number;
    trade_30m_change_percent: number;
    sell_30m: number;
    sell_history_30m: number;
    sell_30m_change_percent: number;
    buy_30m: number;
    buy_history_30m: number;
    buy_30m_change_percent: number;
    volume_30m: number;
    volume_30m_usd: number;
    volume_history_30m: number;
    volume_history_30m_usd: number;
    volume_30m_change_percent: number;
    volume_buy_30m: number;
    volume_buy_30m_usd: number;
    volume_buy_history_30m: number;
    volume_buy_history_30m_usd: number;
    volume_buy_30m_change_percent: number;
    volume_sell_30m: number;
    volume_sell_30m_usd: number;
    volume_sell_history_30m: number;
    volume_sell_history_30m_usd: number;
    volume_sell_30m_change_percent: number;
    trade_1h: number;
    trade_history_1h: number;
    trade_1h_change_percent: number;
    sell_1h: number;
    sell_history_1h: number;
    sell_1h_change_percent: number;
    buy_1h: number;
    buy_history_1h: number;
    buy_1h_change_percent: number;
    volume_1h: number;
    volume_1h_usd: number;
    volume_history_1h: number;
    volume_history_1h_usd: number;
    volume_1h_change_percent: number;
    volume_buy_1h: number;
    volume_buy_1h_usd: number;
    volume_buy_history_1h: number;
    volume_buy_history_1h_usd: number;
    volume_buy_1h_change_percent: number;
    volume_sell_1h: number;
    volume_sell_1h_usd: number;
    volume_sell_history_1h: number;
    volume_sell_history_1h_usd: number;
    volume_sell_1h_change_percent: number;
    trade_2h: number;
    trade_history_2h: number;
    trade_2h_change_percent: number;
    sell_2h: number;
    sell_history_2h: number;
    sell_2h_change_percent: number;
    buy_2h: number;
    buy_history_2h: number;
    buy_2h_change_percent: number;
    volume_2h: number;
    volume_2h_usd: number;
    volume_history_2h: number;
    volume_history_2h_usd: number;
    volume_2h_change_percent: number;
    volume_buy_2h: number;
    volume_buy_2h_usd: number;
    volume_buy_history_2h: number;
    volume_buy_history_2h_usd: number;
    volume_buy_2h_change_percent: number;
    volume_sell_2h: number;
    volume_sell_2h_usd: number;
    volume_sell_history_2h: number;
    volume_sell_history_2h_usd: number;
    volume_sell_2h_change_percent: number;
    trade_4h: number;
    trade_history_4h: number;
    trade_4h_change_percent: number;
    sell_4h: number;
    sell_history_4h: number;
    sell_4h_change_percent: number;
    buy_4h: number;
    buy_history_4h: number;
    buy_4h_change_percent: number;
    volume_4h: number;
    volume_4h_usd: number;
    volume_history_4h: number;
    volume_history_4h_usd: number;
    volume_4h_change_percent: number;
    volume_buy_4h: number;
    volume_buy_4h_usd: number;
    volume_buy_history_4h: number;
    volume_buy_history_4h_usd: number;
    volume_buy_4h_change_percent: number;
    volume_sell_4h: number;
    volume_sell_4h_usd: number;
    volume_sell_history_4h: number;
    volume_sell_history_4h_usd: number;
    volume_sell_4h_change_percent: number;
    trade_8h: number;
    trade_history_8h: number | null;
    trade_8h_change_percent: number | null;
    sell_8h: number;
    sell_history_8h: number | null;
    sell_8h_change_percent: number | null;
    buy_8h: number;
    buy_history_8h: number | null;
    buy_8h_change_percent: number | null;
    volume_8h: number;
    volume_8h_usd: number;
    volume_history_8h: number;
    volume_history_8h_usd: number;
    volume_8h_change_percent: number | null;
    volume_buy_8h: number;
    volume_buy_8h_usd: number;
    volume_buy_history_8h: number;
    volume_buy_history_8h_usd: number;
    volume_buy_8h_change_percent: number | null;
    volume_sell_8h: number;
    volume_sell_8h_usd: number;
    volume_sell_history_8h: number;
    volume_sell_history_8h_usd: number;
    volume_sell_8h_change_percent: number | null;
    trade_24h: number;
    trade_history_24h: number;
    trade_24h_change_percent: number | null;
    sell_24h: number;
    sell_history_24h: number;
    sell_24h_change_percent: number | null;
    buy_24h: number;
    buy_history_24h: number;
    buy_24h_change_percent: number | null;
    volume_24h: number;
    volume_24h_usd: number;
    volume_history_24h: number;
    volume_history_24h_usd: number;
    volume_24h_change_percent: number | null;
    volume_buy_24h: number;
    volume_buy_24h_usd: number;
    volume_buy_history_24h: number;
    volume_buy_history_24h_usd: number;
    volume_buy_24h_change_percent: number | null;
    volume_sell_24h: number;
    volume_sell_24h_usd: number;
    volume_sell_history_24h: number;
    volume_sell_history_24h_usd: number;
    volume_sell_24h_change_percent: number | null;
}

/**
 * Interface representing data for a holder, including address and balance.
 * @typedef {Object} HolderData
 * @property {string} address - The address of the holder.
 * @property {string} balance - The balance of the holder.
 */
export interface HolderData {
    address: string;
    balance: string;
}

/**
 * Interface representing processed token data.
 * @typedef {Object} ProcessedTokenData
 * @property {TokenSecurityData} security - The security data of the token.
 * @property {TokenInfo} tradeData - Information about the token trade.
 * @property {string} holderDistributionTrend - The trend of holder distribution (increasing, decreasing, or stable).
 * @property {Array<{holderAddress: string, balanceUsd: string}>} highValueHolders - Array of high value holders with their address and balance in USD.
 * @property {boolean} recentTrades - Indicates if there have been recent trades.
 * @property {number} highSupplyHoldersCount - The count of high supply holders.
 * @property {DexScreenerData} dexScreenerData - Data from the DEX screener.
 * @property {boolean} isDexScreenerListed - Indicates if the token is listed on the DEX screener.
 * @property {boolean} isDexScreenerPaid - Indicates if the token is paid for in the DEX screener.
 */
export interface ProcessedTokenData {
    security: TokenSecurityData;
    tradeData: TokenInfo;
    holderDistributionTrend: string; // 'increasing' | 'decreasing' | 'stable'
    highValueHolders: Array<{
        holderAddress: string;
        balanceUsd: string;
    }>;
    recentTrades: boolean;
    highSupplyHoldersCount: number;
    dexScreenerData: DexScreenerData;

    isDexScreenerListed: boolean;
    isDexScreenerPaid: boolean;
}

/**
 * Interface representing a pair on a DEX screener
 *
 * @typedef {Object} DexScreenerPair
 * @property {string} chainId - The ID of the chain
 * @property {string} dexId - The ID of the DEX
 * @property {string} url - The URL of the pair
 * @property {string} pairAddress - The address of the pair
 * @property {Object} baseToken - Information about the base token
 * @property {string} baseToken.address - The address of the base token
 * @property {string} baseToken.name - The name of the base token
 * @property {string} baseToken.symbol - The symbol of the base token
 * @property {Object} quoteToken - Information about the quote token
 * @property {string} quoteToken.address - The address of the quote token
 * @property {string} quoteToken.name - The name of the quote token
 * @property {string} quoteToken.symbol - The symbol of the quote token
 * @property {string} priceNative - The price in native currency
 * @property {string} priceUsd - The price in USD
 * @property {Object} txns - Transaction information
 * @property {Object} txns.m5 - Transaction data for last 5 minutes
 * @property {number} txns.m5.buys - Number of buys in last 5 minutes
 * @property {number} txns.m5.sells - Number of sells in last 5 minutes
 * @property {Object} volume - Volume information
 * @property {number} volume.h24 - 24-hour volume
 * @property {number} volume.h6 - 6-hour volume
 * @property {number} volume.h1 - 1-hour volume
 * @property {number} volume.m5 - 5-minute volume
 * @property {Object} priceChange - Price change information
 * @property {number} priceChange.m5 - Price change in last 5 minutes
 * @property {number} priceChange.h1 - Price change in last 1 hour
 * @property {number} priceChange.h6 - Price change in last 6 hours
 * @property {number} priceChange.h24 - Price change in last 24 hours
 * @property {Object} liquidity - Liquidity information
 * @property {number} liquidity.usd - Liquidity in USD
 * @property {number} liquidity.base - Base liquidity
 * @property {number} liquidity.quote - Quote liquidity
 * @property {number} fdv - Fully-diluted valuation
 * @property {number} marketCap - Market capitalization
 * @property {number} pairCreatedAt - Timestamp when pair was created
 * @property {Object} info - Additional information
 * @property {string} info.imageUrl - URL of the pair's image
 * @property {Object[]} info.websites - Array of website information
 * @property {string} info.websites.label - Label for the website
 * @property {string} info.websites.url - URL of the website
 * @property {Object[]} info.socials - Array of social media information
 * @property {string} info.socials.type - Type of social media
 * @property {string} info.socials.url - URL of the social media platform
 * @property {Object} boosts - Boost information
 * @property {number} boosts.active - Number of active boosts
 */
```
export interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        m5: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h24: { buys: number; sells: number };
    };
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info: {
        imageUrl: string;
        websites: { label: string; url: string }[];
        socials: { type: string; url: string }[];
    };
    boosts: {
        active: number;
    };
}

/**
 * Interface for the data returned from a Dex Screener API.
 * @typedef {Object} DexScreenerData
 * @property {string} schemaVersion - The version of the schema used for the data.
 * @property {DexScreenerPair[]} pairs - An array of DexScreenerPair objects representing pairs of tokens.
 */
export interface DexScreenerData {
    schemaVersion: string;
    pairs: DexScreenerPair[];
}

/**
 * Interface to represent prices for different cryptocurrencies.
 * 
 * @interface Prices
 * @property {object} starknet - Object containing USD price for Starknet.
 * @property {string} starknet.usd - USD price for Starknet.
 * @property {object} bitcoin - Object containing USD price for Bitcoin.
 * @property {string} bitcoin.usd - USD price for Bitcoin.
 * @property {object} ethereum - Object containing USD price for Ethereum.
 * @property {string} ethereum.usd - USD price for Ethereum.
 */
export interface Prices {
    starknet: { usd: string };
    bitcoin: { usd: string };
    ethereum: { usd: string };
}

/**
 * Interface representing calculated buy amounts.
 * @interface
 * @property {number} none - The buy amount when there is no buy required.
 * @property {number} low - The low buy amount.
 * @property {number} medium - The medium buy amount.
 * @property {number} high - The high buy amount.
 */
export interface CalculatedBuyAmounts {
    none: 0;
    low: number;
    medium: number;
    high: number;
}
