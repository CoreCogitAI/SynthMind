import { Response } from 'node-fetch';

/**
 * Represents an error specific to Coinbase API requests.
 *
 * @class CoinbaseError
 * @extends Error
 * @property {number} statusCode - The HTTP status code associated with the error.
 * @property {Response} response - The response object associated with the error.
 * @param {string} message - The error message.
 * @param {number} statusCode - The status code of the error.
 * @param {Response} response - The response object associated with the error.
 */
class CoinbaseError extends Error {
  statusCode: number;
  response: Response;

/**
 * Create a new instance of CoinbaseError.
 * @param {string} message - The error message.
 * @param {number} statusCode - The status code of the error response.
 * @param {Response} response - The error response object.
 */
  constructor(message: string, statusCode: number, response: Response) {
    super(message);
    this.name = 'CoinbaseError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Handles exceptions for API calls to Coinbase.
 * If the response status code falls in the range of 400-499 or 500-599, checks the reason for the exception.
 * If the reason is 'Missing required scopes' for a 403 status code, constructs a specific error message.
 * For all other cases, constructs a general error message with the status code, reason, and response text.
 * Throws a CoinbaseError with the appropriate message, status code, and response object.
 *
 * @param {Response} response - The response object from the API call.
 * @param {string} responseText - The response text from the API call.
 * @param {string} reason - The reason for the exception.
 */
export function handleException(
  response: Response,
  responseText: string,
  reason: string
) {
  let message: string | undefined;

  if (
    (400 <= response.status && response.status <= 499) ||
    (500 <= response.status && response.status <= 599)
  ) {
    if (
      response.status == 403 &&
      responseText.includes('"error_details":"Missing required scopes"')
    ) {
      message = `${response.status} Coinbase Error: Missing Required Scopes. Please verify your API keys include the necessary permissions.`;
    } else
      message = `${response.status} Coinbase Error: ${reason} ${responseText}`;

    throw new CoinbaseError(message, response.status, response);
  }
}
