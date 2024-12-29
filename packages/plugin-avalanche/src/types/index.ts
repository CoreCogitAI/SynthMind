import { Address } from "viem";

/**
 * Interface representing a YakSwapQuote object
 * @typedef {Object} YakSwapQuote
 * @property {bigint[]} amounts - The amount of tokens involved in the swap
 * @property {Address[]} adapters - The addresses of the adapters used in the swap
 * @property {Address[]} path - The token addresses in the swap path
 * @property {bigint} gasEstimate - The estimated gas cost of the swap
 */
interface YakSwapQuote {
    amounts: bigint[];
    adapters: Address[];
    path: Address[];
    gasEstimate: bigint;
}

// struct MarketCreationParameters {
//     uint96 tokenType;
//     string name;
//     string symbol;
//     address quoteToken;
//     uint256 totalSupply;
//     uint16 creatorShare;
//     uint16 stakingShare;
//     uint256[] bidPrices;
//     uint256[] askPrices;
//     bytes args;
// }
/**
 * Interface representing the parameters required for creating a token market on TokenMill.
 *
 * @typedef {Object} TokenMillMarketCreationParameters
 * @property {number} tokenType - The type of token.
 * @property {string} name - The name of the token.
 * @property {string} symbol - The symbol of the token.
 * @property {Address} quoteToken - The address of the quote token.
 * @property {bigint} totalSupply - The total supply of the token.
 * @property {number} creatorShare - The creator's share in the market.
 * @property {number} stakingShare - The staking share in the market.
 * @property {bigint[]} bidPrices - An array of bid prices for the token.
 * @property {bigint[]} askPrices - An array of ask prices for the token.
 * @property {string} args - Additional arguments for the market creation.
 */

interface TokenMillMarketCreationParameters {
    tokenType: number;
    name: string;
    symbol: string;
    quoteToken: Address;
    totalSupply: bigint;
    creatorShare: number;
    stakingShare: number;
    bidPrices: bigint[];
    askPrices: bigint[];
    args: string;
}

export type { YakSwapQuote, TokenMillMarketCreationParameters }