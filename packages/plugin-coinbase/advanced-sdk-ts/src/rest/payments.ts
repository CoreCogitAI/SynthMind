import { API_PREFIX } from '../constants';
import { RESTBase } from './rest-base';
import {
  GetPaymentMethodRequest,
  GetPaymentMethodResponse,
  ListPaymentMethodsResponse,
} from './types/payments-types';
import { method } from './types/request-types';

// [GET] List Payment Methods
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethods
/**
 * Fetches the list of payment methods available.
 * 
 * @this RESTBase
 * @returns {Promise<ListPaymentMethodsResponse>} - A promise that resolves with the list of payment methods.
 */
export function listPaymentMethods(
  this: RESTBase
): Promise<ListPaymentMethodsResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/payment_methods`,
    isPublic: false,
  });
}

// [GET] Get Payment Method
// Official Documentation: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethod
/**
 * Retrieves a payment method by its ID.
 * 
 * @param {GetPaymentMethodRequest} - The request object containing the paymentMethodId.
 * @returns {Promise<GetPaymentMethodResponse>} - A promise that resolves to the retrieved payment method.
 */
export function getPaymentMethod(
  this: RESTBase,
  { paymentMethodId }: GetPaymentMethodRequest
): Promise<GetPaymentMethodResponse> {
  return this.request({
    method: method.GET,
    endpoint: `${API_PREFIX}/payment_methods/${paymentMethodId}`,
    isPublic: false,
  });
}
