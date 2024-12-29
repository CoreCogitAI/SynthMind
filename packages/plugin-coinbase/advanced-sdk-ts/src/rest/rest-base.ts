import { generateToken } from '../jwt-generator';
import fetch, { Headers, RequestInit, Response } from 'node-fetch';
import { BASE_URL, USER_AGENT } from '../constants';
import { RequestOptions } from './types/request-types';
import { handleException } from './errors';

/**
 * Represents a base class for making REST API requests.
 */
```
export class RESTBase {
  private apiKey: string | undefined;
  private apiSecret: string | undefined;

/**
 * Constructor for creating an instance of a class with optional key and secret parameters.
 * If key or secret is not provided, only public endpoints will be accessible.
 * 
 * @param {string} [key] - The API key for authentication.
 * @param {string} [secret] - The API secret for authentication.
 */
  constructor(key?: string, secret?: string) {
    if (!key || !secret) {
      console.log('Could not authenticate. Only public endpoints accessible.');
    }
    this.apiKey = key;
    this.apiSecret = secret;
  }

/**
 * Make a request with the specified options.
 *
 * @param {RequestOptions} options - The options for the request.
 * @returns {Promise<any>} A promise that resolves with the result of the request.
 */  
      
  request(options: RequestOptions): Promise<any> {
    const { method, endpoint, isPublic } = options;
    let { queryParams, bodyParams } = options;

    queryParams = queryParams ? this.filterParams(queryParams) : {};

    if (bodyParams !== undefined)
      bodyParams = bodyParams ? this.filterParams(bodyParams) : {};

    return this.prepareRequest(
      method,
      endpoint,
      queryParams,
      bodyParams,
      isPublic
    );
  }

/**
   * Prepares a request with the given HTTP method, URL path, query parameters, body parameters, and access permission.
   * Sets headers, builds URL, and sends the request.
   *
   * @param {string} httpMethod - The HTTP method for the request (e.g. GET, POST).
   * @param {string} urlPath - The path of the URL to send the request to.
   * @param {Record<string, any>} [queryParams] - The query parameters to include in the request.
   * @param {Record<string, any>} [bodyParams] - The body parameters to include in the request.
   * @param {boolean} [isPublic] - Flag to indicate if the request is public or not.
   * @returns {Promise<Response>} A Promise that resolves with the response to the request.
   */
  prepareRequest(
    httpMethod: string,
    urlPath: string,
    queryParams?: Record<string, any>,
    bodyParams?: Record<string, any>,
    isPublic?: boolean
  ) {
    const headers: Headers = this.setHeaders(httpMethod, urlPath, isPublic);

    const requestOptions: RequestInit = {
      method: httpMethod,
      headers: headers,
      body: JSON.stringify(bodyParams),
    };

    const queryString = this.buildQueryString(queryParams);
    const url = `https://${BASE_URL}${urlPath}${queryString}`;

    return this.sendRequest(headers, requestOptions, url);
  }

/**
 * Sends a HTTP request using fetch API.
 * 
 * @param {Headers} headers - The headers to include in the request.
 * @param {RequestInit} requestOptions - The options for the request.
 * @param {string} url - The URL to send the request to.
 * @returns {Promise<string>} - A promise that resolves with the response text.
 */
  async sendRequest(
    headers: Headers,
    requestOptions: RequestInit,
    url: string
  ) {
    const response: Response = await fetch(url, requestOptions);
    const responseText = await response.text();
    handleException(response, responseText, response.statusText);

    return responseText;
  }

/**
 * Set headers for a HTTP request.
 * 
 * @param {string} httpMethod - The HTTP method being used for the request.
 * @param {string} urlPath - The URL path for the request.
 * @param {boolean} [isPublic] - Flag indicating if the endpoint is public or not.
 * @returns {Headers} The headers object with necessary headers added.
 */
  setHeaders(httpMethod: string, urlPath: string, isPublic?: boolean) {
    const headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('User-Agent', USER_AGENT);
    if (this.apiKey !== undefined && this.apiSecret !== undefined)
      headers.append(
        'Authorization',
        `Bearer ${generateToken(
          httpMethod,
          urlPath,
          this.apiKey,
          this.apiSecret
        )}`
      );
    else if (isPublic == undefined || isPublic == false)
      throw new Error(
        'Attempting to access authenticated endpoint with invalid API_KEY or API_SECRET.'
      );

    return headers;
  }

/**
 * Filters out any parameters with value of undefined from the given data object.
 * 
 * @param {Record<string, any>} data - The object containing parameters to be filtered.
 * @returns {Record<string, any>} - The object with only non-undefined parameters.
 */
  filterParams(data: Record<string, any>) {
    const filteredParams: Record<string, any> = {};

    for (const key in data) {
      if (data[key] !== undefined) {
        filteredParams[key] = data[key];
      }
    }

    return filteredParams;
  }

/**
 * Build a query string from the provided query parameters object.
 * 
 * @param {Record<string, any>} [queryParams] - The query parameters object to be converted into a query string.
 * @returns {string} The generated query string.
 */
  buildQueryString(queryParams?: Record<string, any>): string {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return '';
    }

    const queryString = Object.entries(queryParams)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(
            (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
          );
        } else {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
      })
      .join('&');

    return `?${queryString}`;
  }
}
