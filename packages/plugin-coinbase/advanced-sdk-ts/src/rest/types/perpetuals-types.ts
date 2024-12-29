import {
  PerpetualPortfolio,
  PortfolioBalance,
  PortfolioSummary,
  Position,
  PositionSummary,
} from './common-types';

// Allocate Portfolio
/**
 * Type definition for Allocate Portfolio Request.
 * @typedef {Object} AllocatePortfolioRequest
 * @property {string} portfolioUuid - The UUID of the portfolio.
 * @property {string} symbol - The symbol of the asset being allocated.
 * @property {string} amount - The amount of the asset being allocated.
 * @property {string} currency - The currency of the allocation.
 */
export type AllocatePortfolioRequest = {
  // Body Params
  portfolioUuid: string;
  symbol: string;
  amount: string;
  currency: string;
};

/**
 * Represents the response object for allocating a portfolio, 
 * where the keys are strings and the values are never type.
 */
export type AllocatePortfolioResponse = Record<string, never>;

// Get Perpetuals Portfolio Summary
/**
 * Represents a request object for getting a summary of a portfolio of perpetuals.
 * @typedef {Object} GetPerpetualsPortfolioSummaryRequest
 * @property {string} portfolioUuid - The UUID of the portfolio to retrieve the summary for.
 */
export type GetPerpetualsPortfolioSummaryRequest = {
  // Path Params
  portfolioUuid: string;
};

/**
 * Response object containing information about perpetuals portfolios summary.
 *
 * @typedef {Object} GetPerpetualsPortfolioSummaryResponse
 * @property {PerpetualPortfolio[]} [portfolios] - Array of perpetuals portfolios.
 * @property {PortfolioSummary} [summary] - Summary of the portfolios.
 */
export type GetPerpetualsPortfolioSummaryResponse = {
  portfolios?: PerpetualPortfolio[];
  summary?: PortfolioSummary;
};

// List Perpetuals Positions
/**
 * Request type for retrieving list of perpetuals positions
 * @typedef {Object} ListPerpetualsPositionsRequest
 * @property {string} portfolioUuid - The UUID of the portfolio
 */
export type ListPerpetualsPositionsRequest = {
  // Path Params
  portfolioUuid: string;
};

/**
 * Response object representing the list of perpetuals positions.
 * @typedef {Object} ListPerpetualsPositionsResponse
 * @property {Position[]} [positions] - Array of positions.
 * @property {PositionSummary} [summary] - Summary of positions.
 */
export type ListPerpetualsPositionsResponse = {
  positions?: Position[];
  summary?: PositionSummary;
};

// Get Perpetuals Position
/**
 * Type representing a request object for getting perpetuals position.
 * @typedef {Object} GetPerpetualsPositionRequest
 * @property {string} portfolioUuid - The UUID of the portfolio.
 * @property {string} symbol - The symbol of the perpetuals position.
 */ 
       
export type GetPerpetualsPositionRequest = {
  // Path Params
  portfolioUuid: string;
  symbol: string;
};

/**
 * Response object for getting perpetuals position.
 * @typedef {Object} GetPerpetualsPositionResponse
 * @property {Position} position - The position object.
 */
export type GetPerpetualsPositionResponse = {
  position?: Position;
};

// Get Portfolio Balances
/**
 * Represents a request object to get the balances of a portfolio.
 * @typedef {Object} GetPortfolioBalancesRequest
 * @property {string} portfolioUuid - The UUID of the portfolio for which balances are requested.
 */
export type GetPortfolioBalancesRequest = {
  // Path Params
  portfolioUuid: string;
};

/**
 * Response type for fetching portfolio balances
 * @typedef {Object} GetPortfolioBalancesResponse
 * @property {PortfolioBalance[]} portfolio_balancces - Array of portfolio balance objects
 */
export type GetPortfolioBalancesResponse = {
  portfolio_balancces?: PortfolioBalance[];
};

// Opt In or Out of Multi Asset Collateral
/**
 * Represents a request object for opting in or out of multi-asset collateral feature.
 * @typedef {Object} OptInOutMultiAssetCollateralRequest
 * @property {string} [portfolioUuid] - The UUID of the portfolio.
 * @property {boolean} [multiAssetCollateralEnabled] - Indicates whether the multi-asset collateral is enabled or not.
 */
export type OptInOutMultiAssetCollateralRequest = {
  // Body Params
  portfolioUuid?: string;
  multiAssetCollateralEnabled?: boolean;
};

/**
 * Response object for opting in or out of multi-asset collateral.
 * @typedef {Object} OptInOutMultiAssetCollateralResponse
 * @property {boolean} [cross_collateral_enabled] - Flag indicating if cross-collateral is enabled.
 */
export type OptInOutMultiAssetCollateralResponse = {
  cross_collateral_enabled?: boolean;
};
