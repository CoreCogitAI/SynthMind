import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  AllocatePortfolioRequest,
  AllocatePortfolioResponse,
  GetPerpetualsPortfolioSummaryRequest,
  GetPerpetualsPortfolioSummaryResponse,
  GetPerpetualsPositionRequest,
  GetPerpetualsPositionResponse,
  GetPortfolioBalancesRequest,
  GetPortfolioBalancesResponse,
  ListPerpetualsPositionsRequest,
  ListPerpetualsPositionsResponse,
  OptInOutMultiAssetCollateralRequest,
  OptInOutMultiAssetCollateralResponse,
} from './types/perpetuals-types';
import { method } from './types/request-types';

// [POST] Allocate Portfolio
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_allocateportfolio
/**
 * Allocates a portfolio for a given request using the RESTBase instance.
 * 
 * @param {AllocatePortfolioRequest} requestParams - The request parameters for allocating the portfolio.
 * @returns {Promise<AllocatePortfolioResponse>} A promise that resolves with the response of the portfolio allocation.
 */
export function allocatePortfolio(
  this: RESTBase,
  requestParams: AllocatePortfolioRequest
): Promise<AllocatePortfolioResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/intx/allocate`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Perpetuals Portfolio Summary
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxportfoliosummary
/**
 * Retrieves the summary of a perpetuals portfolio.
 * 
 * @param {object} options - The options for the request.
 * @param {string} options.portfolioUuid - The UUID of the portfolio to retrieve the summary for.
 * @returns {Promise<GetPerpetualsPortfolioSummaryResponse>} A Promise that resolves with the summary of the perpetuals portfolio.
 */
export function getPerpetualsPortfolioSummary(
  this: RESTBase,
  { portfolioUuid }: GetPerpetualsPortfolioSummaryRequest
): Promise<GetPerpetualsPortfolioSummaryResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/intx/portfolio/${portfolioUuid}`,
    isPublic: false,
  });
}

// [GET] List Perpetuals Positions
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxpositions
/**
 * Retrieves a list of perpetual positions for a given portfolio.
 * @param {ListPerpetualsPositionsRequest} options - The request options including the portfolio UUID.
 * @returns {Promise<ListPerpetualsPositionsResponse>} - A promise that resolves to the list of perpetual positions for the specified portfolio.
 */
export function listPerpetualsPositions(
  this: RESTBase,
  { portfolioUuid }: ListPerpetualsPositionsRequest
): Promise<ListPerpetualsPositionsResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/intx/positions/${portfolioUuid}`,
    isPublic: false,
  });
}

// [GET] Get Perpetuals Position
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxposition
/**
 * Retrieves the position of a perpetual symbol for a specific portfolio.
 *
 * @param {GetPerpetualsPositionRequest} options - The request options including portfolioUuid and symbol.
 * @returns {Promise<GetPerpetualsPositionResponse>} - The response containing the position of the perpetual symbol.
 */
export function getPerpertualsPosition(
  this: RESTBase,
  { portfolioUuid, symbol }: GetPerpetualsPositionRequest
): Promise<GetPerpetualsPositionResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/intx/positions/${portfolioUuid}/${symbol}`,
    isPublic: false,
  });
}

// [GET] Get Portfolio Balances
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxbalances
/**
 * Retrieves portfolio balances for a specific portfolio UUID.
 * @param {GetPortfolioBalancesRequest} options - The request options.
 * @param {string} options.portfolioUuid - The unique identifier of the portfolio.
 * @returns {Promise<GetPortfolioBalancesResponse>} A promise that resolves with the portfolio balances response.
 */
export function getPortfolioBalances(
  this: RESTBase,
  { portfolioUuid }: GetPortfolioBalancesRequest
): Promise<GetPortfolioBalancesResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/intx/balances/${portfolioUuid}`,
    isPublic: false,
  });
}

// [POST] Opt In or Out of Multi Asset Collateral
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_intxmultiassetcollateral
/**
 * Function to opt in or out of multi-asset collateral.
 * 
 * @param {OptInOutMultiAssetCollateralRequest} requestParams - The request parameters for opting in or out of multi-asset collateral.
 * @returns {Promise<OptInOutMultiAssetCollateralResponse>} - A promise that resolves with the response of the opt in or opt out action.
 */
export function optInOutMultiAssetCollateral(
  this: RESTBase,
  requestParams: OptInOutMultiAssetCollateralRequest
): Promise<OptInOutMultiAssetCollateralResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/intx/multi_asset_collateral`,
    bodyParams: requestParams,
    isPublic: false,
  });
}
