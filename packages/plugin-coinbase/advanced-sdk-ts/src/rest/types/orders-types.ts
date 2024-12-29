import {
  CancelOrderObject,
  ContractExpiryType,
  MarginType,
  Order,
  OrderConfiguration,
  OrderPlacementSource,
  OrderSide,
  ProductType,
  SortBy,
} from './common-types';

// Create Order
/**
 * Request object to create a new order
 *
 * @typedef {Object} CreateOrderRequest
 * @property {string} clientOrderId - The client's unique identifier for the order
 * @property {string} productId - The identifier of the product being traded
 * @property {OrderSide} side - The side of the order (buy or sell)
 * @property {OrderConfiguration} orderConfiguration - The configuration details for the order
 * @property {string} [selfTradePreventionId] - Optional unique identifier to prevent self-trading
 * @property {string} [leverage] - The leverage amount for the order
 * @property {MarginType} [marginType] - The margin type for the order
 * @property {string} [retailPortfolioId] - The identifier of the retail portfolio
 */
export type CreateOrderRequest = {
  // Body Params
  clientOrderId: string;
  productId: string;
  side: OrderSide;
  orderConfiguration: OrderConfiguration;
  selfTradePreventionId?: string;
  leverage?: string;
  marginType?: MarginType;
  retailPortfolioId?: string;
};

/**
 * Represents the response object for creating an order.
 * @typedef {Object} CreateOrderResponse
 * @property {boolean} success - Flag indicating if the order creation was successful.
 * @property {Record<string, any>} [failure_reason] - Deprecated: reason for order creation failure.
 * @property {string} [order_id] - Deprecated: ID of the created order.
 * @property {Object} [response] - Response object containing either success or error response.
 * @property {Record<string, any>} [response.success_response] - Success response object.
 * @property {Record<string, any>} [response.error_response] - Error response object.
 * @property {OrderConfiguration} [order_configuration] - Configuration settings for the created order.
 */
export type CreateOrderResponse = {
  success: boolean;
  failure_reason?: Record<string, any>; // deprecated
  order_id?: string; // deprecated
  response?:
    | { success_response: Record<string, any> }
    | { error_response: Record<string, any> };
  order_configuration?: OrderConfiguration;
};

// Cancel Orders
/**
 * Type representing a request to cancel orders.
 * @typedef {object} CancelOrdersRequest
 * @property {string[]} orderIds - The array of order IDs to be cancelled.
 */
export type CancelOrdersRequest = {
  // Body Params
  orderIds: string[];
};

/**
 * Response object for cancelling orders.
 * @typedef {object} CancelOrdersResponse
 * @property {CancelOrderObject[]} results - List of canceled order objects, may be empty.
 */
export type CancelOrdersResponse = {
  results?: CancelOrderObject[];
};

// Edit Order
/**
 * Represents the request body for editing an order.
 * @typedef {Object} EditOrderRequest
 * @property {string} orderId - The ID of the order to be edited.
 * @property {string} [price] - The new price of the order (optional).
 * @property {string} [size] - The new size of the order (optional).
 */
export type EditOrderRequest = {
  // Body Params
  orderId: string;
  price?: string;
  size?: string;
};

/**
 * Represents the response for editing an order.
 * @typedef {Object} EditOrderResponse
 * @property {boolean} success - Indicates if the operation was successful.
 * @property {Object} response - The response details.
 * @property {Object} [response.success_response] - The success response data. [Deprecated]
 * @property {Object} [response.error_response] - The error response data. [Deprecated]
 * @property {Object[]} [errors] - An array of error details.
 */
export type EditOrderResponse = {
  success: boolean;
  response?:
    | { success_response: Record<string, any> } // deprecated
    | { error_response: Record<string, any> }; // deprecated
  errors?: Record<string, any>[];
};

// Edit Order Preview
/**
 * Represents the request body for editing an order preview.
 * @typedef {Object} EditOrderPreviewRequest
 * @property {string} orderId - The identifier of the order to be edited.
 * @property {string} [price] - The updated price of the order (optional).
 * @property {string} [size] - The updated size of the order (optional).
 */
export type EditOrderPreviewRequest = {
  // Body Params
  orderId: string;
  price?: string;
  size?: string;
};

/**
 * Represents the response object for editing order preview.
 * @typedef {Object} EditOrderPreviewResponse
 * @property {Record<string, any>[]} errors - Array of errors.
 * @property {string} [slippage] - The slippage value.
 * @property {string} [order_total] - The total order value.
 * @property {string} [commission_total] - The total commission value.
 * @property {string} [quote_size] - The quote size value.
 * @property {string} [base_size] - The base size value.
 * @property {string} [best_bid] - The best bid value.
 * @property {string} [average_filled_price] - The average filled price value.
 */
export type EditOrderPreviewResponse = {
  errors: Record<string, any>[];
  slippage?: string;
  order_total?: string;
  commission_total?: string;
  quote_size?: string;
  base_size?: string;
  best_bid?: string;
  average_filled_price?: string;
};

// List Orders
/**
 * Represents a request object for listing orders.
 * @typedef {Object} ListOrdersRequest
 * @property {string[]} [orderIds] - Optional array of order IDs to filter the results.
 * @property {string[]} [productIds] - Optional array of product IDs to filter the results.
 * @property {string[]} [orderStatus] - Optional array of order statuses to filter the results.
 * @property {number} [limit] - Optional limit for the number of results to return.
 * @property {string} [startDate] - Optional start date for filtering the results.
 * @property {string} [endDate] - Optional end date for filtering the results.
 * @property {string} [orderType] - Optional order type to filter the results.
 * @property {OrderSide} [orderSide] - Optional order side to filter the results.
 * @property {string} [cursor] - Optional cursor value for pagination.
 * @property {ProductType} [productType] - Optional product type to filter the results.
 * @property {OrderPlacementSource} [orderPlacementSource] - Optional order placement source to filter the results.
 * @property {ContractExpiryType} [contractExpiryType] - Optional contract expiry type to filter the results.
 * @property {string[]} [assetFilters] - Optional array of asset filters to apply to the results.
 * @property {string} [retailPortfolioId] - Optional retail portfolio ID to filter the results.
 * @property {string} [timeInForces] - Optional time in forces to filter the results.
 * @property {SortBy} [sortBy] - Optional property to sort the results by.
 */
```
export type ListOrdersRequest = {
  // Query Params
  orderIds?: string[];
  productIds?: string[];
  orderStatus?: string[];
  limit?: number;
  startDate?: string;
  endDate?: string;
  orderType?: string;
  orderSide?: OrderSide;
  cursor?: string;
  productType?: ProductType;
  orderPlacementSource?: OrderPlacementSource;
  contractExpiryType?: ContractExpiryType;
  assetFilters?: string[];
  retailPortfolioId?: string;
  timeInForces?: string;
  sortBy?: SortBy;
};

/**
 * Response object containing a list of orders.
 * @typedef {Object} ListOrdersResponse
 * @property {Order[]} orders - Array of orders
 * @property {number} [sequence] - Deprecated
 * @property {boolean} has_next - Indicates if there are more orders to retrieve
 * @property {string} [cursor] - Optional cursor for pagination
 */
export type ListOrdersResponse = {
  orders: Order[];
  sequence?: number; // deprecated
  has_next: boolean;
  cursor?: string;
};

// List Fills
/**
 * Represents the request object for listing fills.
 * @typedef {Object} ListFillsRequest
 * @property {string[]} [orderIds] - The list of order IDs to filter fills.
 * @property {string[]} [tradeIds] - The list of trade IDs to filter fills.
 * @property {string[]} [productIds] - The list of product IDs to filter fills.
 * @property {string} [startSequenceTimestamp] - The start timestamp to filter fills.
 * @property {string} [endSequenceTimestamp] - The end timestamp to filter fills.
 * @property {string} [retailPortfolioId] - The ID of the retail portfolio to filter fills.
 * @property {number} [limit] - The maximum number of fills to return.
 * @property {string} [cursor] - The cursor for paginating results.
 * @property {SortBy} [sortBy] - The field to sort the results by.
 */
export type ListFillsRequest = {
  // Query Params
  orderIds?: string[];
  tradeIds?: string[];
  productIds?: string[];
  startSequenceTimestamp?: string;
  endSequenceTimestamp?: string;
  retailPortfolioId?: string;
  limit?: number;
  cursor?: string;
  sortBy?: SortBy;
};

/**
 * Response object for listing fills.
 * @typedef {Object} ListFillsResponse
 * @property {Object[]} [fills] - Array of fill records.
 * @property {string} [cursor] - Cursor for pagination.
 */
export type ListFillsResponse = {
  fills?: Record<string, any>[];
  cursor?: string;
};

// Get Order
/**
 * GetOrderRequest type for retrieving order information
 * @typedef {Object} GetOrderRequest
 * @property {string} orderId - The unique identifier of the order
 */
export type GetOrderRequest = {
  // Path Params
  orderId: string;
};

/**
 * Response object for getting an order.
 * @typedef {Object} GetOrderResponse
 * @property {Order} order - The order object.
 */
export type GetOrderResponse = {
  order?: Order;
};

// Preview Order
/**
 * Defines the shape of the object used to make a preview order request.
 * @typedef {Object} PreviewOrderRequest
 * @property {string} productId - The ID of the product for the order.
 * @property {OrderSide} side - The side of the order (buy or sell).
 * @property {OrderConfiguration} orderConfiguration - The configuration details for the order.
 * @property {string} [leverage] - The leverage amount for the order (optional).
 * @property {MarginType} [marginType] - The margin type for the order (optional).
 * @property {string} [retailPortfolioId] - The ID of the retail portfolio for the order (optional).
 */
export type PreviewOrderRequest = {
  // Body Params
  productId: string;
  side: OrderSide;
  orderConfiguration: OrderConfiguration;
  leverage?: string;
  marginType?: MarginType;
  retailPortfolioId?: string;
};

/**
 * Represents the response object for previewing an order.
 * @typedef {Object} PreviewOrderResponse
 * @property {string} order_total - The total amount of the order.
 * @property {string} commission_total - The total commission amount for the order.
 * @property {Record<string, any>[]} errs - Array of error records.
 * @property {Record<string, any>[]} warning - Array of warning records.
 * @property {string} quote_size - The size of the quote.
 * @property {string} base_size - The size of the base.
 * @property {string} best_bid - The best bid price.
 * @property {string} best_ask - The best ask price.
 * @property {boolean} is_max - Indicates if the order size is the maximum allowed.
 * @property {string} [order_margin_total] - The total margin required for the order.
 * @property {string} [leverage] - The leverage amount for the order.
 * @property {string} [long_leverage] - The long leverage amount for the order.
 * @property {string} [short_leverage] - The short leverage amount for the order.
 * @property {string} [slippage] - The slippage amount for the order.
 * @property {string} [preview_id] - The unique identifier for the order preview.
 * @property {string} [current_liquidation_buffer] - The current liquidation buffer amount.
 * @property {string} [projected_liquidation_buffer] - The projected liquidation buffer amount.
 * @property {string} [max_leverage] - The maximum leverage allowed for the order.
 * @property {Record<string, any>} [pnl_configuration] - The configuration for profit and loss tracking.
 */
export type PreviewOrderResponse = {
  order_total: string;
  commission_total: string;
  errs: Record<string, any>[];
  warning: Record<string, any>[];
  quote_size: string;
  base_size: string;
  best_bid: string;
  best_ask: string;
  is_max: boolean;
  order_margin_total?: string;
  leverage?: string;
  long_leverage?: string;
  short_leverage?: string;
  slippage?: string;
  preview_id?: string;
  current_liquidation_buffer?: string;
  projected_liquidation_buffer?: string;
  max_leverage?: string;
  pnl_configuration?: Record<string, any>;
};

// Close Position
/**
 * Represents a request to close a position.
 * @typedef {Object} ClosePositionRequest
 * @property {string} clientOrderId - The client's order ID.
 * @property {string} productId - The ID of the product.
 * @property {string} [size] - The size of the position to close (optional).
 */
export type ClosePositionRequest = {
  // Body Params
  clientOrderId: string;
  productId: string;
  size?: string;
};

/**
 * Data structure for the response after closing a position.
 * @typedef {object} ClosePositionResponse
 * @property {boolean} success - Flag indicating if the operation was successful.
 * @property {Object} [response] - Optional response object.
 * @property {Object} [response.success_response] - Success response with key-value pairs.
 * @property {Object} [response.error_response] - Error response with key-value pairs.
 * @property {OrderConfiguration} [order_configuration] - Optional order configuration object.
 */
export type ClosePositionResponse = {
  success: boolean;
  response?:
    | { success_response: Record<string, any> }
    | { error_response: Record<string, any> };
  order_configuration?: OrderConfiguration;
};
