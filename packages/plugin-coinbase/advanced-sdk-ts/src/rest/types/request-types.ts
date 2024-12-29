/**
 * Enum representing HTTP methods.
 * @enum {string}
 * @property {string} GET - GET method
 * @property {string} POST - POST method
 * @property {string} PUT - PUT method
 * @property {string} DELETE - DELETE method
 */
export enum method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * Interface representing options for making a request.
 * @typedef {Object} RequestOptions
 * @property {string} method - The HTTP method for the request.
 * @property {string} endpoint - The API endpoint URL.
 * @property {Object.<string, any>} [queryParams] - Optional query parameters for the request.
 * @property {Object.<string, any>} [bodyParams] - Optional body parameters for the request.
 * @property {boolean} isPublic - Flag indicating if the request is for a public endpoint.
 */
export interface RequestOptions {
  method: method;
  endpoint: string;
  queryParams?: Record<string, any>;
  bodyParams?: Record<string, any>;
  isPublic: boolean;
}
