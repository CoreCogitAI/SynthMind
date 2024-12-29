import { PaymentMethod } from './common-types';

// List Payment Methods
/**
 * Response object for listing payment methods.
 * @typedef {Object} ListPaymentMethodsResponse
 * @property {PaymentMethod} paymentMethods - The list of payment methods available.
 */
export type ListPaymentMethodsResponse = {
  paymentMethods?: PaymentMethod;
};

// Get Payment Method
/**
 * Defines the shape of the request object for retrieving a specific payment method.
 * @typedef {Object} GetPaymentMethodRequest
 * @property {string} paymentMethodId - The unique identifier of the payment method to retrieve.
 */
export type GetPaymentMethodRequest = {
  // Path Params
  paymentMethodId: string;
};

/**
 * Response object for getting a payment method.
 * @typedef {Object} GetPaymentMethodResponse
 * @property {PaymentMethod} [paymentMethod] - The payment method object.
 */
export type GetPaymentMethodResponse = {
  paymentMethod?: PaymentMethod;
};
