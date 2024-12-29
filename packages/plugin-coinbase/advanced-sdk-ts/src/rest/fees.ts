import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  GetTransactionsSummaryRequest,
  GetTransactionsSummaryResponse,
} from './types/fees-types';
import { method } from './types/request-types';

// [GET] Get Transaction Summary
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_commitconverttrade
/**
 * Retrieves a summary of transactions based on the provided request parameters.
 * 
 * @param {GetTransactionsSummaryRequest} requestParams - The request parameters for retrieving the transaction summary.
 * @returns {Promise<GetTransactionsSummaryResponse>} A promise that resolves with the summary of transactions.
 */
export function getTransactionSummary(
  this: RESTBase,
  requestParams: GetTransactionsSummaryRequest
): Promise<GetTransactionsSummaryResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/transaction_summary`,
    queryParams: requestParams,
    isPublic: false,
  });
}
