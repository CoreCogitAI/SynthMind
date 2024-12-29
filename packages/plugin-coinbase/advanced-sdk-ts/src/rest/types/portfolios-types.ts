import { Portfolio, PortfolioBreakdown, PortfolioType } from './common-types';

// List Portfolios
/**
 * Represents the request object for listing portfolios.
 * @typedef {Object} ListPortfoliosRequest
 * @property {PortfolioType} [portfolioType] - The type of portfolio to filter by.
 */
export type ListPortfoliosRequest = {
  // Query Params
  portfolioType?: PortfolioType;
};

/**
 * Defines the structure of the response object when retrieving a list of portfolios.
 * @typedef {Object} ListPortfoliosResponse
 * @property {Portfolio[]} [portfolios] - An array of Portfolio objects representing the portfolios retrieved.
 */
export type ListPortfoliosResponse = {
  portfolios?: Portfolio[];
};

// Create Portfolio
/**
 * Type representing the request object for creating a new portfolio.
 * 
 * @typedef {Object} CreatePortfolioRequest
 * @property {string} name - The name of the portfolio.
 */
export type CreatePortfolioRequest = {
  // Body Params
  name: string;
};

/**
 * Response object after creating a portfolio.
 * @typedef {Object} CreatePortfolioResponse
 * @property {Portfolio} portfolio - The created portfolio, if successfully created.
 */
export type CreatePortfolioResponse = {
  portfolio?: Portfolio;
};

// Move Portfolio Funds
/**
 * Represents a request to move funds between two portfolios.
 * @typedef {Object} MovePortfolioFundsRequest
 * @property {Record<string, any>} funds - The funds to move.
 * @property {string} sourcePortfolioUuid - The UUID of the source portfolio.
 * @property {string} targetPortfolioUuid - The UUID of the target portfolio.
 */
export type MovePortfolioFundsRequest = {
  // Body Params
  funds: Record<string, any>;
  sourcePortfolioUuid: string;
  targetPortfolioUuid: string;
};

/**
 * Response object for moving funds between portfolios.
 * 
 * @typedef {Object} MovePortfolioFundsResponse
 * @property {string} [source_portfolio_uuid] - The UUID of the source portfolio
 * @property {string} [target_portfolio_uuid] - The UUID of the target portfolio
 */
export type MovePortfolioFundsResponse = {
  source_portfolio_uuid?: string;
  target_portfolio_uuid?: string;
};

// Get Portfolio Breakdown
/**
 * Request object for getting portfolio breakdown data.
 * @typedef {Object} GetPortfolioBreakdownRequest
 * @property {string} portfolioUuid - The unique identifier of the portfolio.
 * @property {string} [currency] - The optional currency for the breakdown data.
 */
export type GetPortfolioBreakdownRequest = {
  // Path Params
  portfolioUuid: string;

  // Query Params
  currency?: string;
};

/**
 * Response object for getting portfolio breakdown.
 */
```
export type GetPortfolioBreakdownResponse = {
  breakdown?: PortfolioBreakdown;
};

// Delete Portfolio
/**
 * Type representing a request to delete a portfolio.
 * @typedef {Object} DeletePortfolioRequest
 * @property {string} portfolioUuid - The UUID of the portfolio to be deleted.
 */
export type DeletePortfolioRequest = {
  // Path Params
  portfolioUuid: string;
};

/**
 * Represents the response from a delete portfolio request.
 */
export type DeletePortfolioResponse = Record<string, never>;

// Edit Portfolio
/**
 * Type representing a request to edit a portfolio.
 * @typedef {Object} EditPortfolioRequest
 * @property {string} portfolioUuid - The UUID of the portfolio to be edited (path parameter).
 * @property {string} name - The new name for the portfolio (body parameter).
 */
export type EditPortfolioRequest = {
  // Path Params
  portfolioUuid: string;

  // Body Params
  name: string;
};

/**
 * Response object for editing a portfolio.
 * @typedef {Object} EditPortfolioResponse
 * @property {Portfolio} [portfolio] - The updated portfolio object.
 */
export type EditPortfolioResponse = {
  portfolio?: Portfolio;
};
