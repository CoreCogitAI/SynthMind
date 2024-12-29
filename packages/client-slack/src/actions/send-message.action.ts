import { SlackClientContext, SlackMessage } from '../types/slack-types';

// Cache to store recently sent messages
const recentMessages = new Map<string, { text: string; timestamp: number }>();
const MESSAGE_CACHE_TTL = 5000; // 5 seconds TTL

/**
 * Class representing an action to send a message using Slack API.
export class SendMessageAction {
/**
 * Constructor for creating a new instance of the class.
 * @param {SlackClientContext} context - The Slack client context to be assigned to the instance.
 */
  constructor(private context: SlackClientContext) {}

/**
 * Removes old messages from the recentMessages map that have exceeded the MESSAGE_CACHE_TTL.
 */
  private cleanupOldMessages() {
    const now = Date.now();
    for (const [key, value] of recentMessages.entries()) {
      if (now - value.timestamp > MESSAGE_CACHE_TTL) {
        recentMessages.delete(key);
      }
    }
  }

/**
 * Checks if a Slack message is a duplicate based on the unique key generated from the message's channelId, threadTs, and text.
 * If the message is a duplicate (seen recently), returns true. Otherwise, stores the message in the recentMessages map and returns false.
 * 
 * @param {SlackMessage} message - The Slack message to check for duplicates
 * @returns {boolean} - True if the message is a duplicate, false if it is not
 */
  private isDuplicate(message: SlackMessage): boolean {
    this.cleanupOldMessages();
    
    // Create a unique key for the message
    const messageKey = `${message.channelId}:${message.threadTs || 'main'}:${message.text}`;
    
    // Check if we've seen this message recently
    const recentMessage = recentMessages.get(messageKey);
    if (recentMessage) {
      return true;
    }

    // Store the new message
    recentMessages.set(messageKey, {
      text: message.text,
      timestamp: Date.now()
    });

    return false;
  }

/**
 * Executes the command to send a message on Slack.
 * @param {SlackMessage} message - The Slack message object containing the details of the message to be sent.
 * @returns {Promise<boolean>} A boolean value indicating the success status of sending the message.
 */
  public async execute(message: SlackMessage): Promise<boolean> {
    try {
      // Skip duplicate messages
      if (this.isDuplicate(message)) {
        console.debug('Skipping duplicate message:', message.text);
        return true; // Return true to indicate "success" since we're intentionally skipping
      }

      const result = await this.context.client.chat.postMessage({
        channel: message.channelId,
        text: message.text,
        thread_ts: message.threadTs,
      });

      return result.ok === true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }
}