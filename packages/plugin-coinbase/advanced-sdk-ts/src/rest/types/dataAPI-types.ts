import { PortfolioType } from './common-types';

// Get API Key Permissions
/**
 * Response object for getting API key permissions.
 * @typedef {object} GetAPIKeyPermissionsResponse
 * @property {boolean} [can_view] - Indicates if user has permission to view
 * @property {boolean} [can_trade] - Indicates if user has permission to trade
 * @property {boolean} [can_transfer] - Indicates if user has permission to transfer
 * @property {string} [portfolio_uuid] - UUID of portfolio associated with permissions
 * @property {PortfolioType} [portfolio_type] - Type of portfolio associated with permissions
 */
export type GetAPIKeyPermissionsResponse = {
  can_view?: boolean;
  can_trade?: boolean;
  can_transfer?: boolean;
  portfolio_uuid?: string;
  portfolio_type?: PortfolioType;
};
