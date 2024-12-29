import { ContractExpiryType, ProductType, ProductVenue } from './common-types';

// Get Transactions Summary
/**
 * Request object for getting a summary of transactions.
 * @typedef {Object} GetTransactionsSummaryRequest
 * @property {ProductType} [productType] - The type of product.
 * @property {ContractExpiryType} [contractExpiryType] - The type of contract expiry.
 * @property {ProductVenue} [productVenue] - The venue of the product.
 */
export type GetTransactionsSummaryRequest = {
  // Query Params
  productType?: ProductType;
  contractExpiryType?: ContractExpiryType;
  productVenue?: ProductVenue;
};

/**
 * Response object containing summary information about transactions.
 * @typedef {Object} GetTransactionsSummaryResponse
 * @property {number} total_volume - The total volume of transactions.
 * @property {number} total_fees - The total fees of transactions.
 * @property {Object} fee_tier - The fee tier information.
 * @property {Object} [margin_rate] - The margin rate information (optional).
 * @property {Object} [goods_and_services_tax] - The goods and services tax information (optional).
 * @property {number} [advanced_trade_only_volumes] - The advanced trade only volumes (optional).
 * @property {number} [advanced_trade_only_fees] - The advanced trade only fees (optional).
 * @property {number} [coinbase_pro_volume] - The Coinbase Pro volume (deprecated).
 * @property {number} [coinbase_pro_fees] - The Coinbase Pro fees (deprecated).
 * @property {string} [total_balance] - The total balance.
 * @property {boolean} [has_promo_fee] - Indicates if there is a promotional fee.
 */
```
export type GetTransactionsSummaryResponse = {
  total_volume: number;
  total_fees: number;
  fee_tier: Record<string, any>;
  margin_rate?: Record<string, any>;
  goods_and_services_tax?: Record<string, any>;
  advanced_trade_only_volumes?: number;
  advanced_trade_only_fees?: number;
  coinbase_pro_volume?: number; // deprecated
  coinbase_pro_fees?: number; // deprecated
  total_balance?: string;
  has_promo_fee?: boolean;
};
