// Create Convert Quote
import { RatConvertTrade, TradeIncentiveMetadata } from './common-types';

/**
 * Represents the request body for creating a conversion quote.
 * @typedef {Object} CreateConvertQuoteRequest
 * @property {string} fromAccount - The account to convert from.
 * @property {string} toAccount - The account to convert to.
 * @property {string} amount - The amount to convert.
 * @property {TradeIncentiveMetadata} [tradeIncentiveMetadata] - Optional trade incentive metadata.
 */
export type CreateConvertQuoteRequest = {
  // Body Params
  fromAccount: string;
  toAccount: string;
  amount: string;
  tradeIncentiveMetadata?: TradeIncentiveMetadata;
};

/**
 * Represents the response for creating a convert quote.
 * @typedef {Object} CreateConvertQuoteResponse
 * @property {RatConvertTrade} [trade] - The converted trade information.
 */
export type CreateConvertQuoteResponse = {
  trade?: RatConvertTrade;
};

// Get Convert Trade
/**
 * Type for converting trade request
 * @typedef {Object} GetConvertTradeRequest
 * @property {string} tradeId - The trade ID (Path Params)
 * @property {string} fromAccount - The source account to convert from (Query Params)
 * @property {string} toAccount - The target account to convert to (Query Params)
 */
export type GetConvertTradeRequest = {
  // Path Params
  tradeId: string;

  //Query Params
  fromAccount: string;
  toAccount: string;
};

/**
 * Response object for getting a converted trade.
 * @typedef {Object} GetConvertTradeResponse
 * @property {RatConvertTrade} trade - The converted trade object.
 */
export type GetConvertTradeResponse = {
  trade?: RatConvertTrade;
};

// Commit Convert Trade
/**
 * Request object for converting a trade to a different account.
 * 
 * @typedef {Object} CommitConvertTradeRequest
 * @property {string} tradeId - The ID of the trade to be converted.
 * @property {string} fromAccount - The account to convert the trade from.
 * @property {string} toAccount - The account to convert the trade to.
 */
export type CommitConvertTradeRequest = {
  // Path Params
  tradeId: string;

  // Body Params
  fromAccount: string;
  toAccount: string;
};

/**
 * Response object for converting a trade.
 * @typedef {Object} CommitConvertTradeResponse
 * @property {RatConvertTrade} [trade] - The converted trade object, if available.
 */
export type CommitConvertTradeResponse = {
  trade?: RatConvertTrade;
};
