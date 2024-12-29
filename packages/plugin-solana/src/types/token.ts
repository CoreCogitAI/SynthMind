/**
 * Interface representing token security data.
 * @typedef {object} TokenSecurityData
 * @property {string} ownerBalance - The balance of the token owner.
 * @property {string} creatorBalance - The balance of the token creator.
 * @property {number} ownerPercentage - The percentage owned by the token owner.
 * @property {number} creatorPercentage - The percentage owned by the token creator.
 * @property {string} top10HolderBalance - The balance of the top 10 token holders.
 * @property {number} top10HolderPercent - The percentage owned by the top 10 token holders.
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
 * Interface representing the token codex for a cryptocurrency.
 * @interface
 * @property {string} id - The unique identifier for the token.
 * @property {string} address - The blockchain address of the token.
 * @property {number} cmcId - The CoinMarketCap ID for the token.
 * @property {number} decimals - The number of decimal places for the token.
 * @property {string} name - The name of the token.
 * @property {string} symbol - The symbol representing the token.
 * @property {string} totalSupply - The total supply of the token.
 * @property {string} circulatingSupply - The circulating supply of the token.
 * @property {string} imageThumbUrl - The URL to the thumbnail image of the token.
 * @property {boolean} blueCheckmark - Indicates if the token has a blue checkmark (verified status).
 * @property {boolean} isScam - Indicates if the token is flagged as a scam.
 */
export interface TokenCodex {
    id: string;
    address: string;
    cmcId: number;
    decimals: number;
    name: string;
    symbol: string;
    totalSupply: string;
    circulatingSupply: string;
    imageThumbUrl: string;
    blueCheckmark: boolean;
    isScam: boolean;
}

/**
 * Interface representing token trade data.
 *
 * @typedef {object} TokenTradeData
 * @property {string} address - The address of the token.
 * @property {number} holder - The number of token holders.
 * @property {number} market - The market number.
 * @property {number} last_trade_unix_time - The unix time of the last trade.
 * @property {string} last_trade_human_time - The human-readable time of the last trade.
 * @property {number} price - The price of the token.
 * @property {number} history_30m_price - The price history of the last 30 minutes.
 * @property {number} price_change_30m_percent - The price change percentage in the last 30 minutes.
 * @property {number} history_1h_price - The price history of the last hour.
 * @property {number} price_change_1h_percent - The price change percentage in the last hour.
 * ...
 * (Continues for each time interval and data point)
 * ...
 * @property {number} volume_sell_24h_change_percent - The volume sell change percentage in the last 24 hours.
 */
```
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
 * Interface representing holder data.
 * @interface
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
 * @property {TokenSecurityData} security - Security data of the token.
 * @property {TokenTradeData} tradeData - Trade data of the token.
 * @property {string} holderDistributionTrend - Trend of holder distribution ('increasing' | 'decreasing' | 'stable').
 * @property {Array<{holderAddress: string, balanceUsd: string}>} highValueHolders - Array of high value holders.
 * @property {boolean} recentTrades - Indicates if there have been recent trades.
 * @property {number} highSupplyHoldersCount - The count of high supply holders.
 * @property {DexScreenerData} dexScreenerData - Data from Dex Screener.
 * @property {boolean} isDexScreenerListed - Indicates if listed on Dex Screener.
 * @property {boolean} isDexScreenerPaid - Indicates if paid on Dex Screener.
 * @property {TokenCodex} tokenCodex - Codex information of the token.
 */
export interface ProcessedTokenData {
    security: TokenSecurityData;
    tradeData: TokenTradeData;
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
    tokenCodex: TokenCodex;
}

/**
 * Interface representing a pair on Dex Screener
 *
 * @typedef {Object} DexScreenerPair
 * @property {string} chainId - The chain ID of the pair
 * @property {string} dexId - The DEX ID of the pair
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
 * @property {Object} volume - Volume information
 * @property {Object} priceChange - Price change information
 * @property {Object} liquidity - Liquidity information
 * @property {number} fdv - Fully diluted valuation of the pair
 * @property {number} marketCap - Market capitalization of the pair
 * @property {number} pairCreatedAt - Timestamp of when the pair was created
 * @property {Object} info - Additional information about the pair
 * @property {string} info.imageUrl - The URL of the pair's image
 * @property {Array<{label: string, url: string}>} info.websites - Array of website labels and URLs
 * @property {Array<{type: string, url: string}>} info.socials - Array of social media types and URLs
 * @property {Object} boosts - Boosts information
 * @property {number} boosts.active - Number of active boosts for the pair
 */
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
 * Interface for DexScreenerData representing the data format expected for the Dex screener.
 * @typedef {Object} DexScreenerData
 * @property {string} schemaVersion - The version of the schema.
 * @property {DexScreenerPair[]} pairs - An array of DexScreenerPair objects representing pairs.
 */
export interface DexScreenerData {
    schemaVersion: string;
    pairs: DexScreenerPair[];
}

/**
 * Interface representing prices for different cryptocurrencies.
 * @typedef {object} Prices
 * @property {object} solana - Object containing the USD price of Solana.
 * @property {string} solana.usd - The price of Solana in USD.
 * @property {object} bitcoin - Object containing the USD price of Bitcoin.
 * @property {string} bitcoin.usd - The price of Bitcoin in USD.
 * @property {object} ethereum - Object containing the USD price of Ethereum.
 * @property {string} ethereum.usd - The price of Ethereum in USD.
 */
export interface Prices {
    solana: { usd: string };
    bitcoin: { usd: string };
    ethereum: { usd: string };
}

/**
 * Interface representing different calculated buy amounts.
 * @interface
 * @property {number} none - The buy amount when none is chosen.
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
