import {
  Candles,
  ContractExpiryType,
  ExpiringContractStatus,
  Granularity,
  HistoricalMarketTrade,
  PriceBook,
  Product,
  Products,
  ProductType,
} from './common-types';

// Get Best Bid Ask
/**
 * Represents a request object for getting the best bid and ask for specific products.
 * @typedef {Object} GetBestBidAskRequest
 * @property {string[]} [productIds] - An array of product IDs to filter the results by.
 */
export type GetBestBidAskRequest = {
  // Query Params
  productIds?: string[];
};

/**
 * Response object containing an array of price books for the best bid and ask.
 * @typedef {Object} GetBestBidAskResponse
 * @property {PriceBook[]} pricebooks - Array of price books
 */
export type GetBestBidAskResponse = {
  pricebooks: PriceBook[];
};

// Get Product Book
/**
 * Request object for fetching product book data.
 *
 * @typedef {Object} GetProductBookRequest
 * @property {string} productId - The ID of the product.
 * @property {number} [limit] - The maximum number of items to retrieve.
 * @property {number} [aggregationPriceIncrement] - The price increment for aggregation.
 */
export type GetProductBookRequest = {
  // Query Params
  productId: string;
  limit?: number;
  aggregationPriceIncrement?: number;
};

/**
 * Response object containing the price book of a product.
 * @typedef {Object} GetProductBookResponse
 * @property {PriceBook} pricebook - The price book of the product.
 */
export type GetProductBookResponse = {
  pricebook: PriceBook;
};

// List Products
/**
 * Represents a request to list products with optional query parameters.
 * @typedef {Object} ListProductsRequest
 * @property {number} [limit] - The maximum number of products to return.
 * @property {number} [offset] - The offset for paginating through the list of products.
 * @property {ProductType} [productType] - The type of product.
 * @property {string[]} [productIds] - The IDs of specific products to retrieve.
 * @property {ContractExpiryType} [contractExpiryType] - The type of contract expiry.
 * @property {ExpiringContractStatus} [expiringContractStatus] - The status of expiring contracts.
 * @property {boolean} [getTradabilityStatus] - Indicates whether to get the tradability status of the products.
 * @property {boolean} [getAllProducts] - Indicates whether to retrieve all products.
 */
export type ListProductsRequest = {
  // Query Params
  limit?: number;
  offset?: number;
  productType?: ProductType;
  productIds?: string[];
  contractExpiryType?: ContractExpiryType;
  expiringContractStatus?: ExpiringContractStatus;
  getTradabilityStatus?: boolean;
  getAllProducts?: boolean;
};

/**
 * Response object for listing products.
 * @typedef {Object} ListProductsResponse
 * @property {Products} [body] - The list of products
 */
export type ListProductsResponse = {
  body?: Products;
};

// Get Product
/**
 * Request object for getting product details.
 *
 * @typedef {Object} GetProductRequest
 * @property {string} productId - The unique identifier for the product.
 * @property {boolean} [getTradabilityStatus] - Optional flag to indicate whether to retrieve tradability status information.
 */
export type GetProductRequest = {
  // Path Params
  productId: string;

  // Query Params
  getTradabilityStatus?: boolean;
};

/**
* Response object for getting a product.
* @typedef {Object} GetProductResponse
* @property {Product} [body] - The product data.
*/
export type GetProductResponse = {
  body?: Product;
};

// Get Product Candles
/**
 * Represents the request object for retrieving product candles.
 *
 * @typedef {object} GetProductCandlesRequest
 * @property {string} productId - The product ID.
 * @property {string} start - The start time for the candles.
 * @property {string} end - The end time for the candles.
 * @property {Granularity} granularity - The granularity of the candles.
 * @property {number=} limit - Optional limit for the number of candles to retrieve.
 */
export type GetProductCandlesRequest = {
  // Path Params
  productId: string;

  // Query Params
  start: string;
  end: string;
  granularity: Granularity;
  limit?: number;
};

/**
 * Response object for getting product candles.
 * @typedef {Object} GetProductCandlesResponse
 * @property {Candles} [body] - The candles data in the response.
 */
export type GetProductCandlesResponse = {
  body?: Candles;
};

// Get Market Trades
/**
 * Request object for getting market trades.
 * @typedef {Object} GetMarketTradesRequest
 * @property {string} productId - The ID of the product.
 * @property {number} limit - The maximum number of trades to return.
 * @property {string} [start] - Optional parameter for specifying the start time of trades.
 * @property {string} [end] - Optional parameter for specifying the end time of trades.
 */
export type GetMarketTradesRequest = {
  // Path Params
  productId: string;

  // Query Params
  limit: number;
  start?: string;
  end?: string;
};

/**
 * Response object for retrieving market trades.
 * @typedef {Object} GetMarketTradesResponse
 * @property {HistoricalMarketTrade[]} [trades] - List of historical market trades.
 * @property {string} [best_bid] - The best bid price in the market.
 * @property {string} [best_ask] - The best ask price in the market.
 */
export type GetMarketTradesResponse = {
  trades?: HistoricalMarketTrade[];
  best_bid?: string;
  best_ask?: string;
};
