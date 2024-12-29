import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  CancelOrdersRequest,
  CancelOrdersResponse,
  ClosePositionRequest,
  ClosePositionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  EditOrderPreviewRequest,
  EditOrderPreviewResponse,
  EditOrderRequest,
  EditOrderResponse,
  GetOrderRequest,
  GetOrderResponse,
  ListFillsRequest,
  ListFillsResponse,
  ListOrdersRequest,
  ListOrdersResponse,
  PreviewOrderRequest,
  PreviewOrderResponse,
} from './types/orders-types';
import { method } from './types/request-types';

// [POST] Create Order
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder
/**
 * Creates a new order by sending a POST request to the API endpoint with the provided request parameters.
 * 
 * @param {CreateOrderRequest} requestParams - The parameters needed to create the order.
 * @returns {Promise<CreateOrderResponse>} A Promise that resolves to the response from the API with the created order.
 */
export function createOrder(
  this: RESTBase,
  requestParams: CreateOrderRequest
): Promise<CreateOrderResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/orders`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [POST] Cancel Orders
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders
/**
 * Cancels multiple orders.
 * 
 * @param {CancelOrdersRequest} requestParams - The parameters for cancelling the orders.
 * @returns {Promise<CancelOrdersResponse>} - A promise that resolves with the response of the cancellation operation.
 */
export function cancelOrders(
  this: RESTBase,
  requestParams: CancelOrdersRequest
): Promise<CancelOrdersResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/orders/batch_cancel`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [POST] Edit Order
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_editorder
/**
 * Edit an order.
 * 
 * @param {EditOrderRequest} requestParams - The request parameters for editing the order.
 * @returns {Promise<EditOrderResponse>} - A promise that resolves with the response from editing the order.
 */
export function editOrder(
  this: RESTBase,
  requestParams: EditOrderRequest
): Promise<EditOrderResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/orders/edit`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [POST] Edit Order Preview
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_previeweditorder
/**
 * Function to edit an order preview.
 * 
 * @param {EditOrderPreviewRequest} requestParams - The request parameters for editing the order preview.
 * @returns {Promise<EditOrderPreviewResponse>} A Promise that resolves with the response of editing the order preview.
 */
export function editOrderPreview(
  this: RESTBase,
  requestParams: EditOrderPreviewRequest
): Promise<EditOrderPreviewResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/orders/edit_preview`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [GET] List Orders
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders
/**
 * Function to list historical orders in batch.
 * @param {ListOrdersRequest} requestParams - The request parameters for listing orders.
 * @returns {Promise<ListOrdersResponse>} A promise that resolves with the list of historical orders response.
 */
export function listOrders(
  this: RESTBase,
  requestParams: ListOrdersRequest
): Promise<ListOrdersResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/orders/historical/batch`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] List Fills
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfills
/**
 * Retrieves a list of historical fills for orders.
 * 
 * @param {ListFillsRequest} requestParams - The parameters to use when fetching the list of fills
 * @returns {Promise<ListFillsResponse>} - A promise that resolves with the list of fills response
 */
export function listFills(
  this: RESTBase,
  requestParams: ListFillsRequest
): Promise<ListFillsResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/orders/historical/fills`,
    queryParams: requestParams,
    isPublic: false,
  });
}

// [GET] Get Order
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorder
/**
 * Get details of a specific order.
 * @param {Object} options - The options to request the order.
 * @param {string} options.orderId - The ID of the order to retrieve.
 * @return {Promise<GetOrderResponse>} - The response containing the details of the order.
 */
export function getOrder(
  this: RESTBase,
  { orderId }: GetOrderRequest
): Promise<GetOrderResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/orders/historical/${orderId}`,
    isPublic: false,
  });
}

// [POST] Preview Order
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_previeworder
/**
 * Preview an order before placing it.
 *
 * @param {PreviewOrderRequest} requestParams - The parameters for the order preview.
 * @returns {Promise<PreviewOrderResponse>} A promise that resolves with the preview order response.
 */
export function previewOrder(
  this: RESTBase,
  requestParams: PreviewOrderRequest
): Promise<PreviewOrderResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/orders/preview`,
    bodyParams: requestParams,
    isPublic: false,
  });
}

// [POST] Close Position
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_closeposition
/**
 * Close a position in the user's account.
 * @param {ClosePositionRequest} requestParams - The request parameters for closing the position.
 * @returns {Promise<ClosePositionResponse>} A promise that resolves with the response from closing the position.
 */
export function closePosition(
  this: RESTBase,
  requestParams: ClosePositionRequest
): Promise<ClosePositionResponse> {
  return this.request({
    method: method.POST,
    endpoint: `${API_PREFIX}/orders/close_position`,
    queryParams: undefined,
    bodyParams: requestParams,
    isPublic: false,
  });
}
