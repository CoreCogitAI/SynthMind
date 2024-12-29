import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  CancelPendingFuturesSweep,
  GetCurrentMarginWindowRequest,
  GetCurrentMarginWindowResponse,
  GetFuturesBalanceSummaryResponse,
  GetFuturesPositionRequest,
  GetFuturesPositionResponse,
  GetIntradayMarginSettingResponse,
  ListFuturesPositionsResponse,
  ListFuturesSweepsResponse,
  ScheduleFuturesSweepRequest,
  ScheduleFuturesSweepResponse,
  SetIntradayMarginSettingRequest,
  SetIntradayMarginSettingResponse,
} from './types/futures-types';
import { method } from './types/request-types';

// [GET] Get Futures Balance Summary
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmbalancesummary
/**
 * Get the futures balance summary by making a request to the server.
 * @this RESTBase
 * @returns {Promise<GetFuturesBalanceSummaryResponse>} The response containing the futures balance summary.
 */
export function getFuturesBalanceSummary(
  this: RESTBase
): Promise<GetFuturesBalanceSummaryResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/cfm/balance_summary`,
    isPublic: false,
  });
}

// [GET] Get Intraday Margin Setting
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintradaymarginsetting
/**
 * Retrieves the intraday margin setting from the RESTBase API.
 * 
 * @this {RESTBase}
 * @returns {Promise<GetIntradayMarginSettingResponse>} The response containing the intraday margin setting.
 */
export function getIntradayMarginSetting(
  this: RESTBase
): Promise<GetIntradayMarginSettingResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/cfm/intraday/margin_setting`,
    isPublic: false,
  });
}

// [POST] Set Intraday Margin Setting
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_setintradaymarginsetting
/**
 * Set the intraday margin setting for the RESTBase instance.
 * @param {SetIntradayMarginSettingRequest} requestParams - The parameters for setting the intraday margin.
 * @returns {Promise<SetIntradayMarginSettingResponse>} A Promise that resolves with the response of setting the intraday margin.
 */
export function setIntradayMarginSetting(
  this: RESTBase,
  requestParams: SetIntradayMarginSettingRequest
): Promise<SetIntradayMarginSettingResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/cfm/intraday/margin_setting`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Current Margin Window
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getcurrentmarginwindow
/**
 * Get the current margin window for the RESTBase instance.
 * 
 * @param {GetCurrentMarginWindowRequest} requestParams - The request parameters for getting the current margin window.
 * @returns {Promise<GetCurrentMarginWindowResponse>} A promise that resolves with the response of the current margin window request.
 */
export function getCurrentMarginWindow(
  this: RESTBase,
  requestParams: GetCurrentMarginWindowRequest
): Promise<GetCurrentMarginWindowResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/cfm/intraday/current_margin_window`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] List Futures Positions
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmpositions
/**
 * Fetches list of futures positions.
 * 
 * @returns {Promise<ListFuturesPositionsResponse>} A promise that resolves with a list of futures positions.
 */
export function listFuturesPositions(
  this: RESTBase
): Promise<ListFuturesPositionsResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/cfm/positions`,
    isPublic: false,
  });
}

// [GET] Get Futures Position
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmposition
/**
 * Retrieves futures position for a specific product.
 * @param {GetFuturesPositionRequest} options - The options for the request, including the productId.
 * @returns {Promise<GetFuturesPositionResponse>} A promise that resolves with the futures position response.
 */
export function getFuturesPosition(
  this: RESTBase,
  { productId }: GetFuturesPositionRequest
): Promise<GetFuturesPositionResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/cfm/positions/${productId}`,
    isPublic: false,
  });
}

// [POST] Schedule Futures Sweep
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_schedulefcmsweep
/**
 * Schedule a futures sweep.
 * 
 * @param {ScheduleFuturesSweepRequest} requestParams - The parameters for scheduling the futures sweep.
 * @returns {Promise<ScheduleFuturesSweepResponse>} - A promise that resolves with the response of scheduling the futures sweep.
 */
export function scheduleFuturesSweep(
  this: RESTBase,
  requestParams: ScheduleFuturesSweepRequest
): Promise<ScheduleFuturesSweepResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/cfm/sweeps/schedule`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [GET] List Futures Sweeps
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmsweeps
/**
 * Retrieves a list of futures sweeps from the RESTBase API.
 * 
 * @returns {Promise<ListFuturesSweepsResponse>} A promise that resolves to a list of futures sweeps.
 */
export function listFuturesSweeps(
  this: RESTBase
): Promise<ListFuturesSweepsResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/cfm/sweeps`,
    isPublic: false,
  });
}

// [DELETE] Cancel Pending Futures Sweep
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelfcmsweep
/**
 * Cancels the pending futures sweep by sending a DELETE request to the specified endpoint.
 * @this {RESTBase}
 * @returns {Promise<CancelPendingFuturesSweep>} A promise that resolves with the result of the cancellation.
 */
export function cancelPendingFuturesSweep(
  this: RESTBase
): Promise<CancelPendingFuturesSweep> {
  return this.request({
    method: method.DELETE,
    endpoint: `${API_PREFIX}/cfm/sweeps`,
    isPublic: false,
  });
}
