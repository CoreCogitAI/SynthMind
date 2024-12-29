// ----- ENUMS -----
/**
 * An enumeration representing different types of products.
 * @enum {string}
 * @readonly
 */
         
export enum ProductType {
  UNKNOWN = 'UNKNOWN_PRODUCT_TYPE',
  SPOT = 'SPOT',
  FUTURE = 'FUTURE',
}

/**
 * Enum representing different types of contract expiry.
 * @enum {string}
 * @readonly
 * @property {string} UNKNOWN - Unknown contract expiry type.
 * @property {string} EXPIRING - Contract expiring.
 * @property {string} PERPETUAL - Perpetual contract.
 */
export enum ContractExpiryType {
  UNKNOWN = 'UNKNOWN_CONTRACT_EXPIRY_TYPE',
  EXPIRING = 'EXPIRING',
  PERPETUAL = 'PERPETUAL',
}

/**
 * Enum for Expiring Contract Status
 * @readonly
 * @enum {string}
 * @property {string} UNKNOWN - Unknown expiring contract status
 * @property {string} UNEXPIRED - Status for unexpired contract
 * @property {string} EXPIRED - Status for expired contract
 * @property {string} ALL - Status for all contracts
 */
export enum ExpiringContractStatus {
  UNKNOWN = 'UNKNOWN_EXPIRING_CONTRACT_STATUS',
  UNEXPIRED = 'STATUS_UNEXPIRED',
  EXPIRED = 'STATUS_EXPIRED',
  ALL = 'STATUS_ALL',
}

/**
 * Enum representing the type of portfolio.
 * @readonly
 * @enum {string}
 * @property {string} UNDEFINED - Undefined portfolio type.
 * @property {string} DEFAULT - Default portfolio type.
 * @property {string} CONSUMER - Consumer portfolio type.
 * @property {string} INTX - INTX portfolio type.
 */
export enum PortfolioType {
  UNDEFINED = 'UNDEFINED',
  DEFAULT = 'DEFAULT',
  CONSUMER = 'CONSUMER',
  INTX = 'INTX',
}

/**
 * Enum representing different margin types.
 * @readonly
 * @enum {string}
 * @property {string} CROSS - Cross margin type.
 * @property {string} ISOLATED - Isolated margin type.
 */
export enum MarginType {
  CROSS = 'CROSS',
  ISOLATED = 'ISOLATED',
}

/**
 * Enumeration representing different sources of order placement.
 * 
 * @enum {string}
 * @readonly
 * @typedef {OrderPlacementSource}
 * @property {string} UNKNOWN - Indicates unknown order placement source.
 * @property {string} RETAIL_SIMPLE - Indicates order placement through simple retail interface.
 * @property {string} RETAIL_ADVANCED - Indicates order placement through advanced retail interface.
 */
export enum OrderPlacementSource {
  UNKNOWN = 'UNKNOWN_PLACEMENT_SOURCE',
  RETAIL_SIMPLE = 'RETAIL_SIMPLE',
  RETAIL_ADVANCED = 'RETAIL_ADVANCED',
}

/**
 * Enum representing different options for sorting.
 * 
 * @enum {string}
 * @readonly
 * @property {string} UNKNOWN - Sort by unknown value.
 * @property {string} LIMIT_PRICE - Sort by limit price.
 * @property {string} LAST_FILL_TIME - Sort by last fill time.
 */
export enum SortBy {
  UNKNOWN = 'UNKNOWN_SORT_BY',
  LIMIT_PRICE = 'LIMIT_PRICE',
  LAST_FILL_TIME = 'LAST_FILL_TIME',
}

/**
 * Enum representing the two possible sides of an order.
 * - BUY: indicates a buy order
 * - SELL: indicates a sell order
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Enum representing different stop directions.
 * 
 * @enum {string}
 * @readonly
 */
               
export enum StopDirection {
  UP = 'STOP_DIRECTION_STOP_UP',
  DOWN = 'STOP_DIRECTION_STOP_DOWN',
}

/**
 * Enumeration representing different time granularities.
 * @enum {string}
 * @readonly
 */

export enum Granularity {
  UNKNOWN = 'UNKNOWN_GRANULARITY',
  ONE_MINUTE = 'ONE_MINUTE',
  FIVE_MINUTE = 'FIVE_MINUTE',
  FIFTEEN_MINUTE = 'FIFTEEN_MINUTE',
  THIRTY_MINUTE = 'THIRTY_MINUTE',
  ONE_HOUR = 'ONE_HOUR',
  TWO_HOUR = 'TWO_HOUR',
  SIX_HOUR = 'SIX_HOUR',
  ONE_DAY = 'ONE_DAY',
}

/**
 * Definition of the ProductVenue enum.
 */
export enum ProductVenue {
  UNKNOWN = 'UNKNOWN_VENUE_TYPE',
  CBE = 'CBE',
  FCM = 'FCM',
  INTX = 'INTX',
}

/**
 * Enum representing different types of intraday margin settings.
 * @enum {string}
 */
         
export enum IntradayMarginSetting {
  UNSPECIFIED = 'INTRADAY_MARGIN_SETTING_UNSPECIFIED',
  STANDARD = 'INTRADAY_MARGIN_SETTING_STANDARD',
  INTRADAY = 'INTRADAY_MARGIN_SETTING_INTRADAY',
}

// ----- TYPES -----
/**
 * Data structure representing an account.
 * @typedef {Object} Account
 * @property {string} [uuid] - The unique identifier for the account.
 * @property {string} [name] - The name of the account.
 * @property {string} [currency] - The currency of the account.
 * @property {Record<string, any>} [available_balance] - The available balance of the account.
 * @property {boolean} [default] - Indicates if the account is the default account.
 * @property {boolean} [active] - Indicates if the account is active.
 * @property {string} [created_at] - The date and time when the account was created.
 * @property {string} [updated_at] - The date and time when the account was last updated.
 * @property {string} [deleted_at] - The date and time when the account was deleted.
 * @property {Record<string, any>} [type] - The type of the account.
 * @property {boolean} [ready] - Indicates if the account is ready.
 * @property {Record<string, any>} [hold] - The hold on the account.
 * @property {string} [retail_portfolio_id] - The ID of the retail portfolio associated with the account.
 */
export type Account = {
  uuid?: string;
  name?: string;
  currency?: string;
  available_balance?: Record<string, any>;
  default?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  type?: Record<string, any>;
  ready?: boolean;
  hold?: Record<string, any>;
  retail_portfolio_id?: string;
};

/**
 * Type representing metadata for a trade incentive.
 * @typedef {Object} TradeIncentiveMetadata
 * @property {string} [userIncentiveId] The ID of the user incentive
 * @property {string} [codeVal] The value of the code
 */
export type TradeIncentiveMetadata = {
  userIncentiveId?: string;
  codeVal?: string;
};

/**
 * Defines the possible order configurations for trading.
 * @typedef {Object} OrderConfiguration
 * @property {MarketMarketIoc} market_market_ioc - Market Market IOC configuration
 * @property {SorLimitIoc} sor_limit_ioc - Sor Limit IOC configuration
 * @property {LimitLimitGtc} limit_limit_gtc - Limit Limit GTC configuration
 * @property {LimitLimitGtd} limit_limit_gtd - Limit Limit GTD configuration
 * @property {LimitLimitFok} limit_limit_fok - Limit Limit FOK configuration
 * @property {StopLimitStopLimitGtc} stop_limit_stop_limit_gtc - Stop Limit Stop Limit GTC configuration
 * @property {StopLimitStopLimitGtd} stop_limit_stop_limit_gtd - Stop Limit Stop Limit GTD configuration
 * @property {TriggerBracketGtc} trigger_bracket_gtc - Trigger Bracket GTC configuration
 * @property {TriggerBracketGtd} trigger_bracket_gtd - Trigger Bracket GTD configuration
 */
export type OrderConfiguration =
  | { market_market_ioc: MarketMarketIoc }
  | { sor_limit_ioc: SorLimitIoc }
  | { limit_limit_gtc: LimitLimitGtc }
  | { limit_limit_gtd: LimitLimitGtd }
  | { limit_limit_fok: LimitLimitFok }
  | { stop_limit_stop_limit_gtc: StopLimitStopLimitGtc }
  | { stop_limit_stop_limit_gtd: StopLimitStopLimitGtd }
  | { trigger_bracket_gtc: TriggerBracketGtc }
  | { trigger_bracket_gtd: TriggerBracketGtd };

/**
 * Definition of a MarketMarketIoc type, which can have either a quote_size property of type string or a base_size property of type string.
 */
export type MarketMarketIoc = { quote_size: string } | { base_size: string };

/**
 * Interface representing a service order request limit for a specific instance of curiosity (IOC).
 *
 * @typedef {object} SorLimitIoc
 * @property {string} baseSize - The base size for the limit.
 * @property {string} limitPrice - The limit price for the limit.
 */
export type SorLimitIoc = {
  baseSize: string;
  limitPrice: string;
};

/**
 * Type representing a limit order using the GTC (Good 'Til Canceled) time in force.
 * @typedef {Object} LimitLimitGtc
 * @property {string} baseSize - The size of the order.
 * @property {string} limitPrice - The price at which the order will execute.
 * @property {boolean} postOnly - Whether the order should only be posted and not filled immediately.
 */
export type LimitLimitGtc = {
  baseSize: string;
  limitPrice: string;
  postOnly: boolean;
};

/**
 * Definition for a type representing a limit order with Good-til-Date (GTD) expiration.
 * @typedef {Object} LimitLimitGtd
 * @property {string} baseSize - The base size of the order.
 * @property {string} limitPrice - The limit price of the order.
 * @property {string} endTime - The expiration time for the order.
 * @property {boolean} postOnly - Flag indicating if the order is post only.
 */
export type LimitLimitGtd = {
  baseSize: string;
  limitPrice: string;
  endTime: string;
  postOnly: boolean;
};

/**
 * Represents a type for specifying the base size and limit price for a Limit Limit FOK order.
 * @typedef {Object} LimitLimitFok
 * @property {string} baseSize - The size of the order
 * @property {string} limitPrice - The maximum price at which the order should execute
 */
export type LimitLimitFok = {
  baseSize: string;
  limitPrice: string;
};

/**
 * Represents a stop-limit order with a Good 'Til Cancelled (GTC) duration.
 * @typedef {Object} StopLimitStopLimitGtc
 * @property {string} baseSize - The size of the order.
 * @property {string} limitPrice - The price at which the limit order should be executed.
 * @property {string} stopPrice - The price at which the stop order should be triggered.
 * @property {StopDirection} stopDirection - The direction of the stop order.
 */
export type StopLimitStopLimitGtc = {
  baseSize: string;
  limitPrice: string;
  stopPrice: string;
  stopDirection: StopDirection;
};

/**
 * Type representing a Stop Limit order with Gtd (Good 'til date) feature.
 * @typedef {Object} StopLimitStopLimitGtd
 * @property {string} baseSize - The base size of the order.
 * @property {string} limitPrice - The limit price of the order.
 * @property {string} stopPrice - The stop price of the order.
 * @property {string} endTime - The end time for the order (Gtd).
 * @property {StopDirection} stopDirection - The direction of the stop price.
 */
export type StopLimitStopLimitGtd = {
  baseSize: string;
  limitPrice: string;
  stopPrice: string;
  endTime: string;
  stopDirection: StopDirection;
};

/**
 * Defines the properties of a Trigger Bracket Gtc order.
 *
 * @typedef {Object} TriggerBracketGtc
 * @property {string} baseSize - The base size of the order.
 * @property {string} limitPrice - The limit price of the order.
 * @property {string} stopTriggerPrice - The stop trigger price of the order.
 */
export type TriggerBracketGtc = {
  baseSize: string;
  limitPrice: string;
  stopTriggerPrice: string;
};

/**
 * Represents a Trigger Bracket GTD order with specified properties.
 * @typedef {Object} TriggerBracketGtd
 * @property {string} baseSize - The base size of the order.
 * @property {string} limitPrice - The limit price of the order.
 * @property {string} stopTriggerPrice - The stop trigger price of the order.
 * @property {string} endTime - The end time of the order.
 */
export type TriggerBracketGtd = {
  baseSize: string;
  limitPrice: string;
  stopTriggerPrice: string;
  endTime: string;
};

/**
 * Type for representing a trade in RatConvert.
 * @typedef {Object} RatConvertTrade
 * @property {string} [id] - The ID of the trade.
 * @property {Record<string, any>} [status] - The status of the trade.
 * @property {Record<string, any>} [user_entered_amount] - The user entered amount in the trade.
 * @property {Record<string, any>} [amount] - The total amount in the trade.
 * @property {Record<string, any>} [subtotal] - The subtotal amount in the trade.
 * @property {Record<string, any>} [total] - The total amount including fees in the trade.
 * @property {Record<string, any>} [fees] - The fees applied in the trade.
 * @property {Record<string, any>} [total_fee] - The total fee in the trade.
 * @property {Record<string, any>} [source] - The source details in the trade.
 * @property {Record<string, any>} [target] - The target details in the trade.
 * @property {Record<string, any>} [unit_price] - The unit price details in the trade.
 * @property {Record<string, any>} [user_warnings] - Any warnings for the user in the trade.
 * @property {string} [user_reference] - The user reference for the trade.
 * @property {string} [source_currency] - The source currency used in the trade.
 * @property {Record<string, any>} [cancellation_reason] - The reason for trade cancellation.
 * @property {string} [source_id] - The ID of the source in the trade.
 * @property {string} [target_id] - The ID of the target in the trade.
 * @property {Record<string, any>} [subscription_info] - Information about subscription related to the trade.
 * @property {Record<string, any>} [exchange_rate] - The exchange rate details in the trade.
 * @property {Record<string, any>} [tax_details] - Details about taxes applied in the trade.
 * @property {Record<string, any>} [trade_incentive_info] - Information about trade incentives.
 * @property {Record<string, any>} [total_fee_without_tax] - The total fee without tax in the trade.
 * @property {Record<string, any>} [fiat_denoted_total] - The total amount denoted in fiat currency.
 */
```
export type RatConvertTrade = {
  id?: string;
  status?: Record<string, any>;
  user_entered_amount?: Record<string, any>;
  amount?: Record<string, any>;
  subtotal?: Record<string, any>;
  total?: Record<string, any>;
  fees?: Record<string, any>;
  total_fee?: Record<string, any>;
  source?: Record<string, any>;
  target?: Record<string, any>;
  unit_price?: Record<string, any>;
  user_warnings?: Record<string, any>;
  user_reference?: string;
  source_curency?: string;
  cancellation_reason?: Record<string, any>;
  source_id?: string;
  target_id?: string;
  subscription_info?: Record<string, any>;
  exchange_rate?: Record<string, any>;
  tax_details?: Record<string, any>;
  trade_incentive_info?: Record<string, any>;
  total_fee_without_tax?: Record<string, any>;
  fiat_denoted_total?: Record<string, any>;
};

/**
 * Represents the summary of FCM (Futures Commission Merchant) balance details.
 * @typedef {object} FCMBalanceSummary
 * @property {object} [futures_buying_power] - The futures buying power balance.
 * @property {object} [total_usd_balance] - The total USD balance.
 * @property {object} [cbi_usd_balance] - The CBI (Central Bank of Iraq) USD balance.
 * @property {object} [cfm_usd_balance] - The CFM (Currency Future Market) USD balance.
 * @property {object} [total_open_orders_hold_amount] - The total amount on hold for open orders.
 * @property {object} [unrealized_pnl] - The unrealized profit and loss.
 * @property {object} [daily_realized_pnl] - The daily realized profit and loss.
 * @property {object} [initial_margin] - The initial margin required.
 * @property {object} [available_margin] - The available margin for trading.
 * @property {object} [liquidation_threshold] - The liquidation threshold amount.
 * @property {object} [liquidation_buffer_amount] - The amount in liquidation buffer.
 * @property {string} [liquidation_buffer_percentage] - The percentage of liquidation buffer.
 * @property {object} [intraday_margin_window_measure] - The intraday margin window measure.
 * @property {object} [overnight_margin_window_measure] - The overnight margin window measure.
 */
```
export type FCMBalanceSummary = {
  futures_buying_power?: Record<string, any>;
  total_usd_balance?: Record<string, any>;
  cbi_usd_balance?: Record<string, any>;
  cfm_usd_balance?: Record<string, any>;
  total_open_orders_hold_amount?: Record<string, any>;
  unrealized_pnl?: Record<string, any>;
  daily_realized_pnl?: Record<string, any>;
  initial_margin?: Record<string, any>;
  available_margin?: Record<string, any>;
  liquidation_threshold?: Record<string, any>;
  liquidation_buffer_amount?: Record<string, any>;
  liquidation_buffer_percentage?: string;
  intraday_margin_window_measure?: Record<string, any>;
  overnight_margin_window_measure?: Record<string, any>;
};

/**
 * Type representing the position of a contract on FCM (Futures Commission Merchant).
 * @typedef {Object} FCMPosition
 * @property {string} [product_id] - The ID of the product.
 * @property {Record<string, any>} [expiration_time] - The expiration time of the contract.
 * @property {Record<string, any>} [side] - The side of the position.
 * @property {string} [number_of_contracts] - The number of contracts in the position.
 * @property {string} [current_price] - The current price of the contract.
 * @property {string} [avg_entry_price] - The average entry price of the contract.
 * @property {string} [unrealized_pnl] - The unrealized profit or loss of the position.
 * @property {string} [daily_realized_pnl] - The daily realized profit or loss of the position.
 */
export type FCMPosition = {
  product_id?: string;
  expiration_time?: Record<string, any>;
  side?: Record<string, any>;
  number_of_contracts?: string;
  current_price?: string;
  avg_entry_price?: string;
  unrealized_pnl?: string;
  daily_realized_pnl?: string;
};

/**
 * Represents a FCMSweep object.
 * @typedef {Object} FCMSweep
 * @property {string} id - The ID of the FCMSweep object.
 * @property {Record<string, any>} requested_amount - The requested amount associated with the FCMSweep.
 * @property {boolean} should_sweep_all - Indicates whether all should be swept.
 * @property {Record<string, any>} status - The status of the FCMSweep.
 * @property {Record<string, any>} schedule_time - The schedule time of the FCMSweep.
 */
export type FCMSweep = {
  id: string;
  requested_amount: Record<string, any>;
  should_sweep_all: boolean;
  status: Record<string, any>;
  schedule_time: Record<string, any>;
};

/**
 * Represents the structure of an object used to cancel an order.
 * @typedef {Object} CancelOrderObject
 * @property {boolean} success - Indicates if the order cancellation was successful.
 * @property {Record<string, any>} failure_reason - The reason for the failure, if applicable.
 * @property {string} order_id - The unique identifier of the order.
 */
export type CancelOrderObject = {
  success: boolean;
  failure_reason: Record<string, any>;
  order_id: string;
};

/**
 * Defines the structure of an Order object.
 * @typedef {Object} Order
 * @property {string} order_id - The unique identifier for the order.
 * @property {string} product_id - The unique identifier for the product associated with the order.
 * @property {string} user_id - The unique identifier for the user who placed the order.
 * @property {OrderConfiguration} order_configuration - The configuration settings for the order.
 * @property {OrderSide} side - The side of the order (buy or sell).
 * @property {string} client_order_id - The client-assigned unique identifier for the order.
 * @property {Record<string, any>} status - The status of the order.
 * @property {Record<string, any>} [time_in_force] - The time in force settings for the order.
 * @property {Record<string, any>} created_time - The timestamp when the order was created.
 * @property {string} completion_percentage - The percentage of completion for the order.
 * @property {string} [filled_size] - The size of the order that has been filled.
 * @property {string} average_filled_price - The average price at which the order has been filled.
 * @property {string} [fee] - The fee associated with the order.
 * @property {string} number_of_fills - The number of fills that have occurred for the order.
 * @property {string} [filled_value] - The total value of the filled portion of the order.
 * @property {boolean} pending_cancel - Indicates if the order is pending cancellation.
 * @property {boolean} size_in_quote - Indicates if the size is in quote currency.
 * @property {string} total_fees - The total fees associated with the order.
 * @property {boolean} size_inclusive_of_fees - Indicates if the size includes fees.
 * @property {string} total_value_after_fees - The total value of the order after fees.
 * @property {Record<string, any>} [trigger_status] - The trigger status of the order.
 * @property {Record<string, any>} [order_type] - The type of order.
 * @property {Record<string, any>} [reject_reason] - The reason for rejecting the order.
 * @property {boolean} [settled] - Indicates if the order is settled.
 * @property {ProductType} [product_type] - The type of product associated with the order.
 * @property {string} [reject_message] - The message associated with rejecting the order.
 * @property {string} [cancel_message] - The message associated with canceling the order.
 * @property {OrderPlacementSource} [order_placement_source] - The source of the order placement.
 * @property {string} [outstanding_hold_amount] - The amount still on hold for the order.
 * @property {boolean} [is_liquidation] - Indicates if the order is a liquidation.
 * @property {Record<string, any>} [last_fill_time] - The timestamp of the last fill of the order.
 * @property {Record<string, any>[]} [edit_history] - The history of edits made to the order.
 * @property {string} [leverage] - The leverage used for the order.
 * @property {MarginType} [margin_type] - The type of margin used for the order.
 * @property {string} [retail_portfolio_id] - The unique identifier for the retail portfolio associated with the order.
 * @property {string} [originating_order_id] - The unique identifier of the original order, if this is a modification.
 * @property {string} [attached_order_id] - The unique identifier of the attached order, if this is linked to another order.
 */
```
export type Order = {
  order_id: string;
  product_id: string;
  user_id: string;
  order_configuration: OrderConfiguration;
  side: OrderSide;
  client_order_id: string;
  status: Record<string, any>;
  time_in_force?: Record<string, any>;
  created_time: Record<string, any>;
  completion_percentage: string;
  filled_size?: string;
  average_filled_price: string;
  fee?: string;
  number_of_fills: string;
  filled_value?: string;
  pending_cancel: boolean;
  size_in_quote: boolean;
  total_fees: string;
  size_inclusive_of_fees: boolean;
  total_value_after_fees: string;
  trigger_status?: Record<string, any>;
  order_type?: Record<string, any>;
  reject_reason?: Record<string, any>;
  settled?: boolean;
  product_type?: ProductType;
  reject_message?: string;
  cancel_message?: string;
  order_placement_source?: OrderPlacementSource;
  outstanding_hold_amount?: string;
  is_liquidation?: boolean;
  last_fill_time?: Record<string, any>;
  edit_history?: Record<string, any>[];
  leverage?: string;
  margin_type?: MarginType;
  retail_portfolio_id?: string;
  originating_order_id?: string;
  attached_order_id?: string;
};

/**
 * Represents a payment method.
 * @typedef {Object} PaymentMethod
 * @property {string} [id] - The ID of the payment method.
 * @property {string} [type] - The type of the payment method.
 * @property {string} [name] - The name of the payment method.
 * @property {string} [currency] - The currency of the payment method.
 * @property {boolean} [verified] - Indicates if the payment method is verified.
 * @property {boolean} [allow_buy] - Indicates if buying is allowed for this payment method.
 * @property {boolean} [allow_sell] - Indicates if selling is allowed for this payment method.
 * @property {boolean} [allow_deposit] - Indicates if depositing is allowed for this payment method.
 * @property {boolean} [allow_withdraw] - Indicates if withdrawing is allowed for this payment method.
 * @property {string} [created_at] - The date and time when the payment method was created.
 * @property {string} [updated_at] - The date and time when the payment method was last updated.
 */
export type PaymentMethod = {
  id?: string;
  type?: string;
  name?: string;
  currency?: string;
  verified?: boolean;
  allow_buy?: boolean;
  allow_sell?: boolean;
  allow_deposit?: boolean;
  allow_withdraw?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Data structure representing a perpetual portfolio.
 * @typedef {Object} PerpetualPortfolio
 * @property {string} [portfolio_uuid] - The UUID of the portfolio.
 * @property {string} [collateral] - The amount of collateral in the portfolio.
 * @property {string} [position_notional] - The notional value of the position.
 * @property {string} [open_position_notional] - The notional value of the open position.
 * @property {string} [pending_fees] - The amount of pending fees.
 * @property {string} [borrow] - The borrowed amount.
 * @property {string} [accrued_interest] - The amount of accrued interest.
 * @property {string} [rolling_debt] - The rolling debt amount.
 * @property {string} [portfolio_initial_margin] - The initial margin of the portfolio.
 * @property {Record<string, any>} [portfolio_im_notional] - A record of portfolio initial margin notional.
 * @property {string} [liquidation_percentage] - The liquidation percentage.
 * @property {string} [liquidation_buffer] - The liquidation buffer amount.
 * @property {Record<string, any>} [margin_type] - A record of margin types.
 * @property {Record<string, any>} [margin_flags] - A record of margin flags.
 * @property {Record<string, any>} [liquidation_status] - A record of liquidation statuses.
 * @property {Record<string, any>} [unrealized_pnl] - A record of unrealized profit and loss.
 * @property {Record<string, any>} [total_balance] - A record of total balance amounts.
 */
```
export type PerpetualPortfolio = {
  portfolio_uuid?: string;
  collateral?: string;
  position_notional?: string;
  open_position_notional?: string;
  pending_fees?: string;
  borrow?: string;
  accrued_interest?: string;
  rolling_debt?: string;
  portfolio_initial_margin?: string;
  portfolio_im_notional?: Record<string, any>;
  liquidation_percentage?: string;
  liquidation_buffer?: string;
  margin_type?: Record<string, any>;
  margin_flags?: Record<string, any>;
  liquidation_status?: Record<string, any>;
  unrealized_pnl?: Record<string, any>;
  total_balance?: Record<string, any>;
};

/**
 * Represents a summary of a portfolio.
 * @typedef {Object} PortfolioSummary
 * @property {Record<string, any>} [unrealized_pnl] - The unrealized profit and loss of the portfolio.
 * @property {Record<string, any>} [buying_power] - The available buying power of the portfolio.
 * @property {Record<string, any>} [total_balance] - The total balance of the portfolio.
 * @property {Record<string, any>} [max_withdrawal_amount] - The maximum withdrawal amount allowed from the portfolio.
 */
export type PortfolioSummary = {
  unrealized_pnl?: Record<string, any>;
  buying_power?: Record<string, any>;
  total_balance?: Record<string, any>;
  max_withdrawal_amount?: Record<string, any>;
};

/**
 * Represents a position summary with aggregated P&L information.
 * @typedef {Object} PositionSummary
 * @property {Record<string, any>} [aggregated_pnl] - The aggregated P&L information.
 */
export type PositionSummary = {
  aggregated_pnl?: Record<string, any>;
};

/**
 * Type representing a position in a trading system.
 * @typedef {Object} Position
 * @property {string} [product_id] - The ID of the product.
 * @property {string} [product_uuid] - The UUID of the product.
 * @property {string} [portfolio_uuid] - The UUID of the portfolio.
 * @property {string} [symbol] - The symbol of the position.
 * @property {Object} [vwap] - The volume-weighted average price.
 * @property {Object} [entry_vwap] - The entry volume-weighted average price.
 * @property {Object} [position_side] - The position side details.
 * @property {Object} [margin_type] - The margin type details.
 * @property {string} [net_size] - The net size of the position.
 * @property {string} [buy_order_size] - The size of buy orders.
 * @property {string} [sell_order_size] - The size of sell orders.
 * @property {string} [im_contribution] - The IM contribution.
 * @property {Object} [unrealized_pnl] - The unrealized profit and loss details.
 * @property {Object} [mark_price] - The mark price of the position.
 * @property {Object} [liquidation_price] - The liquidation price details.
 * @property {string} [leverage] - The leverage used in the position.
 * @property {Object} [im_notional] - The IM notional details.
 * @property {Object} [mm_notional] - The MM notional details.
 * @property {Object} [position_notional] - The position notional details.
 * @property {Object} [aggregated_pnl] - The aggregated profit and loss details.
 */
```
export type Position = {
  product_id?: string;
  product_uuid?: string;
  portfolio_uuid?: string;
  symbol?: string;
  vwap?: Record<string, any>;
  entry_vwap?: Record<string, any>;
  position_side?: Record<string, any>;
  margin_type?: Record<string, any>;
  net_size?: string;
  buy_order_size?: string;
  sell_order_size?: string;
  im_contribution?: string;
  unrealized_pnl?: Record<string, any>;
  mark_price?: Record<string, any>;
  liquidation_price?: Record<string, any>;
  leverage?: string;
  im_notional?: Record<string, any>;
  mm_notional?: Record<string, any>;
  position_notional?: Record<string, any>;
  aggregated_pnl?: Record<string, any>;
};

/**
 * Represents the balance information of an asset.
 * @typedef {object} Balance
 * @property {Record<string, any>} asset - The asset information.
 * @property {string} quantity - The quantity of the asset.
 * @property {string} hold - The amount on hold.
 * @property {string} transfer_hold - The amount on hold for transfers.
 * @property {string} collateral_value - The collateral value.
 * @property {string} collateral_weight - The collateral weight.
 * @property {string} max_withdraw_amount - The maximum withdrawal amount.
 * @property {string} loan - The loan amount.
 * @property {string} loan_collateral_requirement_usd - The collateral requirement for loans in USD.
 * @property {string} pledged_quantity - The pledged quantity.
 */
export type Balance = {
  asset: Record<string, any>;
  quantity: string;
  hold: string;
  transfer_hold: string;
  collateral_value: string;
  collateral_weight: string;
  max_withdraw_amount: string;
  loan: string;
  loan_collateral_requirement_usd: string;
  pledged_quantity: string;
};

/**
 * Definition of a Portfolio object.
 * @typedef {Object} Portfolio
 * @property {string} [name] - The name of the portfolio.
 * @property {string} [uuid] - The unique identifier of the portfolio.
 * @property {string} [type] - The type of the portfolio.
 */
export type Portfolio = {
  name?: string;
  uuid?: string;
  type?: string;
};

/**
 * Represents the breakdown of a portfolio including various components.
 * @typedef {Object} PortfolioBreakdown
 * @property {Portfolio} [portfolio] - The portfolio object.
 * @property {Record<string, any>} [portfolio_balances] - The balances within the portfolio.
 * @property {Record<string, any>[]} [spot_positions] - Array of spot positions within the portfolio.
 * @property {Record<string, any>[]} [perp_positions] - Array of perpetual positions within the portfolio.
 * @property {Record<string, any>[]} [futures_positions] - Array of futures positions within the portfolio.
 */ 

export type PortfolioBreakdown = {
  portfolio?: Portfolio;
  portfolio_balances?: Record<string, any>;
  spot_positions?: Record<string, any>[];
  perp_positions?: Record<string, any>[];
  futures_positions?: Record<string, any>[];
};

/**
 * PriceBook type representing the structure of a price book.
 * @typedef {Object} PriceBook
 * @property {string} product_id - The ID of the product.
 * @property {Record<string, any>[]} bids - Array of bid records.
 * @property {Record<string, any>[]} asks - Array of ask records.
 * @property {Record<string, any>} [time] - Optional time record.
 */
export type PriceBook = {
  product_id: string;
  bids: Record<string, any>[];
  asks: Record<string, any>[];
  time?: Record<string, any>;
};

/**
 * Type representing a collection of products.
 * @typedef {Object} Products
 * @property {Product[]} products - An array of products.
 * @property {number} num_products - The number of products in the collection.
 */
export type Products = {
  products?: Product[];
  num_products?: number;
};

/**
 * Represents a product in a trading platform.
 * @typedef {Object} Product
 * @property {string} product_id - The unique ID of the product.
 * @property {string} price - The current price of the product.
 * @property {string} price_percentage_change_24h - The percentage change in price in the last 24 hours.
 * @property {string} volume_24h - The trading volume in the last 24 hours.
 * @property {string} volume_percentage_change_24h - The percentage change in volume in the last 24 hours.
 * @property {string} base_increment - The base currency increment.
 * @property {string} quote_increment - The quote currency increment.
 * @property {string} quote_min_size - The minimum quote size.
 * @property {string} quote_max_size - The maximum quote size.
 * @property {string} base_min_size - The minimum base size.
 * @property {string} base_max_size - The maximum base size.
 * @property {string} base_name - The name of the base currency.
 * @property {string} quote_name - The name of the quote currency.
 * @property {boolean} watched - Whether the product is being watched.
 * @property {boolean} is_disabled - Whether the product is disabled.
 * @property {boolean} new - Whether the product is new.
 * @property {string} status - The status of the product.
 * @property {boolean} cancel_only - Whether the product is cancel-only.
 * @property {boolean} limit_only - Whether the product is limit-only.
 * @property {boolean} post_only - Whether the product is post-only.
 * @property {boolean} trading_disabled - Whether trading is disabled for the product.
 * @property {boolean} auction_mode - Whether the product is in auction mode.
 * @property {ProductType} [product_type] - The type of product.
 * @property {string} [quote_currency_id] - The ID of the quote currency.
 * @property {string} [base_currency_id] - The ID of the base currency.
 * @property {Record<string, any>} [fcm_trading_session_details] - Details of the trading session.
 * @property {string} [mid_market_price] - The mid-market price of the product.
 * @property {string} [alias] - An alias for the product.
 * @property {string[]} [alias_to] - An array of aliases for the product.
 * @property {string} base_display_symbol - The display symbol of the base currency.
 * @property {string} [quote_display_symbol] - The display symbol of the quote currency.
 * @property {boolean} [view_only] - Whether the product is view-only.
 * @property {string} [price_increment] - The price increment of the product.
 * @property {string} [display_name] - The display name of the product.
 * @property {ProductVenue} [product_venue] - The venue of the product.
 * @property {string} [approximate_quote_24h_volume] - The approximate trading volume in the last 24 hours.
 * @property {Record<string, any>} [future_product_details] - Details of future product.
export type Product = {
  product_id: string;
  price: string;
  price_percentage_change_24h: string;
  volume_24h: string;
  volume_percentage_change_24h: string;
  base_increment: string;
  quote_increment: string;
  quote_min_size: string;
  quote_max_size: string;
  base_min_size: string;
  base_max_size: string;
  base_name: string;
  quote_name: string;
  watched: boolean;
  is_disabled: boolean;
  new: boolean;
  status: string;
  cancel_only: boolean;
  limit_only: boolean;
  post_only: boolean;
  trading_disabled: boolean;
  auction_mode: boolean;
  product_type?: ProductType;
  quote_currency_id?: string;
  base_currency_id?: string;
  fcm_trading_session_details?: Record<string, any>;
  mid_market_price?: string;
  alias?: string;
  alias_to?: string[];
  base_display_symbol: string;
  quote_display_symbol?: string;
  view_only?: boolean;
  price_increment?: string;
  display_name?: string;
  product_venue?: ProductVenue;
  approximate_quote_24h_volume?: string;
  future_product_details?: Record<string, any>;
};

/**
 * A type representing an object that has an optional array of Candle objects.
 */
export type Candles = {
  candles?: Candle[];
};

/**
 * Represents a Candle object with optional properties for start time, low price, high price, opening price, closing price, and volume.
 */
export type Candle = {
  start?: string;
  low?: string;
  high?: string;
  open?: string;
  close?: string;
  volume?: string;
};

/**
 * Defines the shape of a historical market trade object.
 * @typedef {Object} HistoricalMarketTrade
 * @property {string} [trade_id] - The unique identifier of the trade.
 * @property {string} [product_id] - The identifier of the product related to the trade.
 * @property {string} [price] - The price at which the trade occurred.
 * @property {string} [size] - The size of the trade.
 * @property {string} [time] - The timestamp of the trade.
 * @property {OrderSide} [side] - The side of the trade (buy or sell).
 */
export type HistoricalMarketTrade = {
  trade_id?: string;
  product_id?: string;
  price?: string;
  size?: string;
  time?: string;
  side?: OrderSide;
};

/**
 * Definition of a portfolio balance object.
 * 
 * @typedef {Object} PortfolioBalance
 * @property {string} [portfolio_uuid] - The UUID of the portfolio.
 * @property {Balance[]} [balances] - An array of balance objects.
 * @property {boolean} [is_margin_limit_reached] - Indicates if the margin limit has been reached.
 */
export type PortfolioBalance = {
  portfolio_uuid?: string;
  balances?: Balance[];
  is_margin_limit_reached?: boolean;
};
