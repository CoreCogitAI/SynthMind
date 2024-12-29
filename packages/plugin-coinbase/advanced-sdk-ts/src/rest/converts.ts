import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  CommitConvertTradeRequest,
  CommitConvertTradeResponse,
  CreateConvertQuoteRequest,
  CreateConvertQuoteResponse,
  GetConvertTradeRequest,
  GetConvertTradeResponse,
} from './types/converts-types';
import { method } from './types/request-types';

// [POST] Create Convert Quote
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_createconvertquote
/**
 * Creates a new convert quote.
 * @param {CreateConvertQuoteRequest} requestParams - The parameters for creating the convert quote.
 * @returns {Promise<CreateConvertQuoteResponse>} A promise that resolves with the response of creating the convert quote.
 */
export function createConvertQuote(
  this: RESTBase,
  requestParams: CreateConvertQuoteRequest
): Promise<CreateConvertQuoteResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/convert/quote`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Convert Trade
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getconverttrade
/**
 * Retrieves information about a specific converted trade.
 * 
 * @param {GetConvertTradeRequest} options - The options for the request, including the trade ID to retrieve information for.
 * @returns {Promise<GetConvertTradeResponse>} A Promise that resolves with the response data of the converted trade.
 */
export function getConvertTrade(
  this: RESTBase,
  { tradeId, ...requestParams }: GetConvertTradeRequest
): Promise<GetConvertTradeResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/convert/trade/${tradeId}`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [POST] Commit Connvert Trade
// https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_commitconverttrade
/**
 * Converts trade by making a POST request to the API endpoint.
 * @param {CommitConvertTradeRequest} options - The options for converting the trade.
 * @param {string} options.tradeId - The ID of the trade to convert.
 * @param {any} options.requestParams - Other request parameters for converting the trade.
 * @returns {Promise<CommitConvertTradeResponse>} A Promise that resolves with the response data of the converted trade.
 */
export function commitConvertTrade(
  this: RESTBase,
  { tradeId, ...requestParams }: CommitConvertTradeRequest
): Promise<CommitConvertTradeResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/convert/trade/${tradeId}`,
    bodyParams: requestParams,
    isPublic: false,
  });
}
