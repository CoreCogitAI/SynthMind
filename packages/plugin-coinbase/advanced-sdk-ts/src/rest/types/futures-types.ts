import {
  FCMBalanceSummary,
  FCMPosition,
  FCMSweep,
  IntradayMarginSetting,
} from './common-types';

// Get Futures Balance Summary
/**
 * Response object for getting futures balance summary.
 * @typedef {Object} GetFuturesBalanceSummaryResponse
 * @property {FCMBalanceSummary} balance_summary - The summary of the futures balance.
 */
export type GetFuturesBalanceSummaryResponse = {
  balance_summary?: FCMBalanceSummary;
};

// Get Intraday Margin Setting
/**
 * Response object containing the intraday margin setting.
 * @typedef {Object} GetIntradayMarginSettingResponse
 * @property {IntradayMarginSetting} setting - The intraday margin setting.
 */
export type GetIntradayMarginSettingResponse = {
  setting?: IntradayMarginSetting;
};

// Set Intraday Margin Setting
/**
 * Type representing a request to set intraday margin settings.
 * @typedef {Object} SetIntradayMarginSettingRequest
 * @property {IntradayMarginSetting} setting - The intraday margin setting to be set.
 */
export type SetIntradayMarginSettingRequest = {
  // Body Params
  setting?: IntradayMarginSetting;
};

/**
 * Response object for setting intraday margin setting.
 */
export type SetIntradayMarginSettingResponse = Record<string, never>;

// Get Current Margin Window
/**
 * Request object for getting the current margin window.
 * @typedef {Object} GetCurrentMarginWindowRequest
 * @property {string} [marginProfileType] - The type of margin profile to use for the request (optional).
 */
export type GetCurrentMarginWindowRequest = {
  // Query Params
  marginProfileType?: string;
};

/**
 * Object representing the response for getting the current margin window.
 * @typedef {Object} GetCurrentMarginWindowResponse
 * @property {Record<string, any>} [margin_window] - The margin window.
 * @property {boolean} [is_intraday_margin_killswitch_enabled] - Flag indicating if the intraday margin killswitch is enabled.
 * @property {boolean} [is_intraday_margin_enrollment_killswitch_enabled] - Flag indicating if the intraday margin enrollment killswitch is enabled.
 */
export type GetCurrentMarginWindowResponse = {
  margin_window?: Record<string, any>;
  is_intraday_margin_killswitch_enabled?: boolean;
  is_intraday_margin_enrollment_killswitch_enabled?: boolean;
};

// List Futures Positions
/**
 * Response from a request to list futures positions.
 * @typedef {Object} ListFuturesPositionsResponse
 * @property {FCMPosition[]} positions - Array of futures positions
 */
export type ListFuturesPositionsResponse = {
  positions?: FCMPosition[];
};

// Get Futures Position
/**
 * Represents the request object for getting futures position with the specified product ID.
 * @typedef {Object} GetFuturesPositionRequest
 * @property {string} productId - The product ID for which the futures position is being requested.
 */
export type GetFuturesPositionRequest = {
  // Path Params
  productId: string;
};

/**
 * Response object for retrieving futures position.
 * 
 * @typedef {Object} GetFuturesPositionResponse
 * @property {FCMPosition} position - The futures position information.
 */
export type GetFuturesPositionResponse = {
  position?: FCMPosition;
};

// Schedule Futures Sweep
/**
 * Request object for scheduling futures sweep operation.
 * @typedef {Object} ScheduleFuturesSweepRequest
 * @property {string} [usdAmount] - The amount in USD to be swept.
 */
export type ScheduleFuturesSweepRequest = {
  // Body Params
  usdAmount?: string;
};

/**
 * Response object for scheduling futures sweep.
 * @typedef {Object} ScheduleFuturesSweepResponse
 * @property {boolean} [success] - Indicates if the scheduling was successful.
 */
export type ScheduleFuturesSweepResponse = {
  success?: boolean;
};

// List Futures Sweeps
/**
 * Response object for listing future sweeps.
 * @typedef {Object} ListFuturesSweepsResponse
 * @property {FCMSweep[]} sweeps - An array of future sweeps.
 */
export type ListFuturesSweepsResponse = {
  sweeps: FCMSweep[];
};

// Cancel Pending Futures Sweep = {
/**
 * Type representing the result of a cancellation of pending futures sweep.
 * @typedef {Object} CancelPendingFuturesSweep
 * @property {boolean} [success] - Indicates if the cancellation was successful
 */
export type CancelPendingFuturesSweep = {
  success?: boolean;
};
