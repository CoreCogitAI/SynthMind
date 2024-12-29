import { Account } from './common-types';

// Get Account
/**
 * Request object for getting account information.
 * @typedef {object} GetAccountRequest
 * @property {string} accountUuid - The unique identifier for the account being requested.
 */
export type GetAccountRequest = {
  // Path Params
  accountUuid: string;
};

/**
 * Response object for the GetAccount API call.
 * @typedef {Object} GetAccountResponse
 * @property {Account} [account] - The account information retrieved from the API call.
 */
export type GetAccountResponse = {
  account?: Account;
};

// List Accounts
/**
 * Represents the request object for listing accounts.
 * @typedef {Object} ListAccountsRequest
 * @property {number} [limit] - The maximum number of results to return.
 * @property {string} [cursor] - A token to retrieve the next page of results.
 * @property {string} [retailPortfolioId] - The ID of the retail portfolio to filter by.
 */
export type ListAccountsRequest = {
  // Query Params
  limit?: number;
  cursor?: string;
  retailPortfolioId?: string;
};

/**
 * Represents the response object for listing accounts.
 * @typedef {Object} ListAccountsResponse
 * @property {Account[]} [accounts] - The list of accounts.
 * @property {boolean} has_next - Indicates if there are more accounts available.
 * @property {string} [cursor] - The cursor for fetching the next set of accounts.
 * @property {number} [size] - The total number of accounts returned.
 */
export type ListAccountsResponse = {
  accounts?: Account[];
  has_next: boolean;
  cursor?: string;
  size?: number;
};
