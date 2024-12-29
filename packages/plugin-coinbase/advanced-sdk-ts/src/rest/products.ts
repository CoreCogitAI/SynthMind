import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  GetBestBidAskRequest,
  GetBestBidAskResponse,
  GetMarketTradesRequest,
  GetMarketTradesResponse,
  GetProductBookRequest,
  GetProductBookResponse,
  GetProductCandlesRequest,
  GetProductCandlesResponse,
  GetProductRequest,
  GetProductResponse,
  ListProductsRequest,
  ListProductsResponse,
} from './types/products-types';
import { method } from './types/request-types';

// [GET] Get Best Bid Ask
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getbestbidask
/**
 * Retrieve the best bid and ask prices for a given request.
 * 
 * @param {GetBestBidAskRequest} requestParams - The request parameters for retrieving the best bid and ask prices.
 * @returns {Promise<GetBestBidAskResponse>} - A Promise that resolves with the best bid and ask prices response.
 */
export function getBestBidAsk(
  this: RESTBase,
  requestParams: GetBestBidAskRequest
): Promise<GetBestBidAskResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/best_bid_ask`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Product Book
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getproductbook
/**
 * Function to get product book data from the API.
 * @param {GetProductBookRequest} requestParams - The request parameters for fetching product book data.
 * @returns {Promise<GetProductBookResponse>} The promise that resolves with the product book data response.
 */
export function getProductBook(
  this: RESTBase,
  requestParams: GetProductBookRequest
): Promise<GetProductBookResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/product_book`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] List Products
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getproducts
/**
 * Function to list products based on the request parameters.
 * @param {ListProductsRequest} requestParams - The request parameters for listing products.
 * @returns {Promise<ListProductsResponse>} A Promise that resolves with the list of products.
 */
export function listProducts(
  this: RESTBase,
  requestParams: ListProductsRequest
): Promise<ListProductsResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/products`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Product
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getproduct
/**
 * Retrieves product information from the API.
 * 
 * @param {Object} GetProductRequest - The request parameters for retrieving the product.
 * @param {string} GetProductRequest.productId - The ID of the product to retrieve.
 * @param {Object} GetProductRequest.requestParams - Additional request parameters.
 * @returns {Promise<GetProductResponse>} A promise that resolves with the product information.
 */
export function getProduct(
  this: RESTBase,
  { productId, ...requestParams }: GetProductRequest
): Promise<GetProductResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/products/${productId}`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Product Candles
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getcandles
/**
 * Fetches candles data for a specific product.
 * @param {Object} params - The parameters for the request.
 * @param {string} params.productId - The ID of the product to fetch candles for.
 * @param {...Object} params.requestParams - Additional request parameters.
 * @returns {Promise<Object>} - A promise that resolves with the candles data.
 */
export function getProductCandles(
  this: RESTBase,
  { productId, ...requestParams }: GetProductCandlesRequest
): Promise<GetProductCandlesResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/products/${productId}/candles`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Market Trades
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getmarkettrades
/**
 * Retrieves market trades for a given product ID.
 * 
 * @param {GetMarketTradesRequest} options - The options for the request, including the product ID and any additional request parameters.
 * @returns {Promise<GetMarketTradesResponse>} A Promise that resolves with the market trades response.
 */
export function getMarketTrades(
  this: RESTBase,
  { productId, ...requestParams }: GetMarketTradesRequest
): Promise<GetMarketTradesResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/products/${productId}/ticker`,
    queryParams: requestParams,
    isPublic: false,
  });
}
