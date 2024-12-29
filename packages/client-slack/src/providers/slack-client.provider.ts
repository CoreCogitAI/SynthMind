import { WebClient } from '@slack/web-api';
import { SlackConfig, SlackClientContext } from '../types/slack-types';
import { SlackUtils, RetryOptions } from '../utils/slack-utils';

/**
 * Slack client provider class for interacting with Slack API.
 */
export class SlackClientProvider {
  private client: WebClient;
  private config: SlackConfig;
  private retryOptions: RetryOptions;

/**
 * Constructor for creating a new instance of SlackClient.
 * @param {SlackConfig} config - The configuration settings for the Slack client.
 * @param {RetryOptions} [retryOptions={}] - Optional retry options for handling failed requests.
 */
  constructor(config: SlackConfig, retryOptions: RetryOptions = {}) {
    this.config = config;
    this.client = new WebClient(config.botToken);
    this.retryOptions = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      ...retryOptions,
    };
  }

/**
 * Get the context of the Slack client.
 * @returns {SlackClientContext} The context of the Slack client containing the client and config properties.
 */
  public getContext(): SlackClientContext {
    return {
      client: this.client,
      config: this.config,
    };
  }

/**
 * Validates the connection to the Slack API.
 * @returns {Promise<boolean>} A Promise that resolves to true if the connection is valid, false otherwise.
 */
  public async validateConnection(): Promise<boolean> {
    try {
      const result = await SlackUtils.withRateLimit(
        () => this.client.auth.test(),
        this.retryOptions
      );

      if (result.ok) {
        this.config.botId = result.user_id || this.config.botId;
        console.log('Bot ID:', this.config.botId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Slack connection validation failed:', error);
      return false;
    }
  }

/**
 * Sends a message to a Slack channel with retry functionality.
 * @param {string} channel - The Slack channel to send the message to.
 * @param {string} text - The text of the message to send.
 * @returns {Promise<any>} - A Promise that resolves when the message is successfully sent.
 */
  public async sendMessage(channel: string, text: string): Promise<any> {
    return SlackUtils.sendMessageWithRetry(
      this.client,
      channel,
      text,
      this.retryOptions
    );
  }

/**
 * Reply to a message in a thread within a specific channel.
 *
 * @param {string} channel - The ID of the channel where the thread exists.
 * @param {string} threadTs - The timestamp of the thread message.
 * @param {string} text - The text to reply with in the thread.
 * @returns {Promise<any>} A Promise that resolves with the result of replying in the thread.
 */
  public async replyInThread(channel: string, threadTs: string, text: string): Promise<any> {
    return SlackUtils.replyInThread(
      this.client,
      channel,
      threadTs,
      text,
      this.retryOptions
    );
  }

/**
 * Validates if a given channel ID is valid in the Slack workspace.
 * 
 * @param {string} channelId - The ID of the channel to validate.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the channel is valid.
 */
  public async validateChannel(channelId: string): Promise<boolean> {
    return SlackUtils.validateChannel(this.client, channelId);
  }

/**
 * Format a message for Slack using the specified text and options.
 * @param {string} text - The main text content of the message.
 * @param {Object} [options] - The additional options for the message formatting.
 * @param {Array} [options.blocks] - An array of block elements for the message.
 * @param {Array} [options.attachments] - An array of attachments for the message.
 * @returns {string} The formatted message for Slack.
 */
  public formatMessage(text: string, options?: {
    blocks?: any[];
    attachments?: any[];
  }) {
    return SlackUtils.formatMessage(text, options);
  }

/**
 * Calls a function with rate limiting applied.
 * @template T
 * @param {() => Promise<T>} fn - The function to be called with rate limiting applied.
 * @returns {Promise<T>} A promise that resolves with the result of the function call.
 */
  public async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return SlackUtils.withRateLimit(fn, this.retryOptions);
  }
}