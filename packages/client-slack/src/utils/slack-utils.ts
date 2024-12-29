import { WebClient } from "@slack/web-api";

/**
 * Interface representing options for retrying an operation.
 * @typedef {object} RetryOptions
 * @property {number} [maxRetries] - The maximum number of retries allowed.
 * @property {number} [initialDelay] - The initial delay before the first retry.
 * @property {number} [maxDelay] - The maximum delay allowed between retries.
 */
export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
}

/**
 * Interface for message options with the ability to specify a thread timestamp.
 * Extends RetryOptions interface.
 * @param {string} threadTs - The timestamp of the thread.
 */
export interface MessageOptions extends RetryOptions {
    threadTs?: string;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
};

/**
 * Utility class for interacting with Slack API
 */
export class SlackUtils {
    /**
     * Sends a message to a Slack channel with retry mechanism
     */
/**
 * Sends a message with retry mechanism in case of failure.
 *
 * @param {WebClient} client - The WebClient instance for communicating with the Slack API.
 * @param {string} channel - The channel ID where the message should be sent.
 * @param {string} text - The text of the message to be sent.
 * @param {MessageOptions} [options={}] - Additional options for sending the message.
 * @returns {Promise<any>} The result of sending the message.
 * @throws {Error} If the message fails to send after the maximum number of retries.
 */
    static async sendMessageWithRetry(
        client: WebClient,
        channel: string,
        text: string,
        options: MessageOptions = {}
    ) {
        const { threadTs, ...retryOpts } = options;
        const finalRetryOpts = { ...DEFAULT_RETRY_OPTIONS, ...retryOpts };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < finalRetryOpts.maxRetries; attempt++) {
            try {
                const result = await client.chat.postMessage({
                    channel,
                    text,
                    thread_ts: threadTs,
                });
                return result;
            } catch (error) {
                lastError = error as Error;
                if (attempt < finalRetryOpts.maxRetries - 1) {
                    const delay = Math.min(
                        finalRetryOpts.initialDelay * Math.pow(2, attempt),
                        finalRetryOpts.maxDelay
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(
            `Failed to send message after ${finalRetryOpts.maxRetries} attempts: ${lastError?.message}`
        );
    }

    /**
     * Validates if a channel exists and is accessible
     */
    static async validateChannel(
        client: WebClient,
        channelId: string
    ): Promise<boolean> {
        try {
            const result = await client.conversations.info({
                channel: channelId,
            });
            return result.ok === true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     * Formats a message for Slack with optional blocks
     */
    static formatMessage(
        text: string,
        options?: {
            blocks?: any[];
            attachments?: any[];
        }
    ) {
        return {
            text,
            ...options,
        };
    }

    /**
     * Creates a thread reply
     */
    static async replyInThread(
        client: WebClient,
        channel: string,
        threadTs: string,
        text: string,
        options: RetryOptions = {}
    ) {
        return this.sendMessageWithRetry(client, channel, text, {
            ...options,
            threadTs,
        });
    }

    /**
     * Handles rate limiting by implementing exponential backoff
     */
    static async withRateLimit<T>(
        fn: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const retryOpts = { ...DEFAULT_RETRY_OPTIONS, ...options };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retryOpts.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;
                if (
                    error instanceof Error &&
                    error.message.includes("rate_limited")
                ) {
                    const delay = Math.min(
                        retryOpts.initialDelay * Math.pow(2, attempt),
                        retryOpts.maxDelay
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }

        throw new Error(
            `Operation failed after ${retryOpts.maxRetries} attempts: ${lastError?.message}`
        );
    }
}
