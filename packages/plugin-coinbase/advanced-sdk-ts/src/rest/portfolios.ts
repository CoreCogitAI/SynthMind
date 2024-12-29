import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  CreatePortfolioRequest,
  CreatePortfolioResponse,
  DeletePortfolioRequest,
  DeletePortfolioResponse,
  EditPortfolioRequest,
  EditPortfolioResponse,
  GetPortfolioBreakdownRequest,
  GetPortfolioBreakdownResponse,
  ListPortfoliosRequest,
  ListPortfoliosResponse,
  MovePortfolioFundsRequest,
  MovePortfolioFundsResponse,
} from './types/portfolios-types';
import { method } from './types/request-types';

// [GET] List Portfolios
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfolios
/**
 * Function to list portfolios.
 *
 * @param {ListPortfoliosRequest} requestParams - The request params for listing portfolios.
 * @returns {Promise<ListPortfoliosResponse>} A promise that resolves with the list of portfolios.
 */
export function listPortfolios(
  this: RESTBase,
  requestParams: ListPortfoliosRequest
): Promise<ListPortfoliosResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/portfolios`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [POST] Create Portfolio
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_createportfolio
/**
 * Creates a new portfolio.
 * @param {CreatePortfolioRequest} requestParams - The parameters for creating the portfolio.
 * @returns {Promise<CreatePortfolioResponse>} A Promise that resolves to the response of creating the portfolio.
 */
export function createPortfolio(
  this: RESTBase,
  requestParams: CreatePortfolioRequest
): Promise<CreatePortfolioResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/portfolios`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [POST] Move Portfolio Funds
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_moveportfoliofunds
/**
 * Moves funds within a portfolio.
 * @param {MovePortfolioFundsRequest} requestParams - The request parameters for moving funds.
 * @returns {Promise<MovePortfolioFundsResponse>} A promise that resolves with the response data after moving funds.
 */
export function movePortfolioFunds(
  this: RESTBase,
  requestParams: MovePortfolioFundsRequest
): Promise<MovePortfolioFundsResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/portfolios/move_funds`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Portfolio Breakdown
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfoliobreakdown
/**
 * Retrieves the breakdown of a specific portfolio.
 *
 * @param {Object} options - The options for the request.
 * @param {string} options.portfolioUuid - The UUID of the portfolio to retrieve breakdown for.
 * @param {Object} options.requestParams - Additional request parameters.
 * @returns {Promise<GetPortfolioBreakdownResponse>} A Promise that resolves with the breakdown of the specified portfolio.
 */
export function getPortfolioBreakdown(
  this: RESTBase,
  { portfolioUuid, ...requestParams }: GetPortfolioBreakdownRequest
): Promise<GetPortfolioBreakdownResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/portfolios/${portfolioUuid}`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [DELETE] Delete Portfolio
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_deleteportfolio
/**
 * Deletes a portfolio.
 * 
 * @param {DeletePortfolioRequest} options - The request options.
 * @param {string} options.portfolioUuid - The UUID of the portfolio to delete.
 * @returns {Promise<DeletePortfolioResponse>} A Promise that resolves with the response of the deletion.
 */
export function deletePortfolio(
  this: RESTBase,
  { portfolioUuid }: DeletePortfolioRequest
): Promise<DeletePortfolioResponse> {
  return this.request({
    method: method.DELETE,
    endpoint: `${API_PREFIX}/portfolios/${portfolioUuid}`,
    isPublic: false,
  });
}

// [PUT] Edit Portfolio
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_editportfolio
/**
 * Edit a portfolio specified by the uuid.
 * @param {EditPortfolioRequest} args - The request parameters for editing the portfolio.
 * @returns {Promise<EditPortfolioResponse>} A promise that resolves with the response from the API.
 */
export function editPortfolio(
  this: RESTBase,
  { portfolioUuid, ...requestParams }: EditPortfolioRequest
): Promise<EditPortfolioResponse> {
  return this.request({
    method: method.PUT,
    endpoint: `${API_PREFIX}/portfolios/${portfolioUuid}`,
    bodyParams: requestParams,
    isPublic: false,
  });
}
