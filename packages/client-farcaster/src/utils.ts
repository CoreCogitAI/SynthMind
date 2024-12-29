import { stringToUuid } from "@elizaos/core";

export const MAX_CAST_LENGTH = 1024; // Updated to Twitter's current character limit

/**
 * Concatenates the given hash and agentId strings with a hyphen in between.
 * 
 * @param {Object} params - The parameters for concatenation.
 * @param {string} params.hash - The hash string.
 * @param {string} params.agentId - The agentId string.
 * @returns {string} The concatenated string of hash and agentId.
 */
export function castId({ hash, agentId }: { hash: string; agentId: string }) {
    return `${hash}-${agentId}`;
}

/**
 * Casts a hash and agentId to a UUID format.
 * 
 * @param {Object} props - The hash and agentId properties.
 * @param {string} props.hash - The hash to be casted to UUID.
 * @param {string} props.agentId - The agentId to be casted to UUID.
 * @returns {string} - The UUID format generated from the hash and agentId.
export function castUuid(props: { hash: string; agentId: string }) {
    return stringToUuid(castId(props));
}

/**
 * Splits the given content into multiple posts based on a maximum length.
 * If a paragraph exceeds the maxLength, it will be split into smaller chunks.
 *
 * @param {string} content - The content to split into posts.
 * @param {number} [maxLength=MAX_CAST_LENGTH] - The maximum length for each post.
 * @returns {string[]} An array of posts after splitting the content.
 */
export function splitPostContent(
    content: string,
    maxLength: number = MAX_CAST_LENGTH
): string[] {
    const paragraphs = content.split("\n\n").map((p) => p.trim());
    const posts: string[] = [];
    let currentTweet = "";

    for (const paragraph of paragraphs) {
        if (!paragraph) continue;

        if ((currentTweet + "\n\n" + paragraph).trim().length <= maxLength) {
            if (currentTweet) {
                currentTweet += "\n\n" + paragraph;
            } else {
                currentTweet = paragraph;
            }
        } else {
            if (currentTweet) {
                posts.push(currentTweet.trim());
            }
            if (paragraph.length <= maxLength) {
                currentTweet = paragraph;
            } else {
                // Split long paragraph into smaller chunks
                const chunks = splitParagraph(paragraph, maxLength);
                posts.push(...chunks.slice(0, -1));
                currentTweet = chunks[chunks.length - 1];
            }
        }
    }

    if (currentTweet) {
        posts.push(currentTweet.trim());
    }

    return posts;
}

/**
 * Splits a given paragraph into chunks of text that are each within the specified maximum length.
 * @param {string} paragraph - The paragraph to split into chunks.
 * @param {number} maxLength - The maximum length each chunk of text should be.
 * @returns {string[]} An array of strings representing the chunks of text within the specified maximum length.
 */
export function splitParagraph(paragraph: string, maxLength: number): string[] {
    const sentences = paragraph.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [
        paragraph,
    ];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).trim().length <= maxLength) {
            if (currentChunk) {
                currentChunk += " " + sentence;
            } else {
                currentChunk = sentence;
            }
        } else {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            if (sentence.length <= maxLength) {
                currentChunk = sentence;
            } else {
                // Split long sentence into smaller pieces
                const words = sentence.split(" ");
                currentChunk = "";
                for (const word of words) {
                    if (
                        (currentChunk + " " + word).trim().length <= maxLength
                    ) {
                        if (currentChunk) {
                            currentChunk += " " + word;
                        } else {
                            currentChunk = word;
                        }
                    } else {
                        if (currentChunk) {
                            chunks.push(currentChunk.trim());
                        }
                        currentChunk = word;
                    }
                }
            }
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Populates mentions in a given text string with the corresponding user display names
 * 
 * @param {string} text - The text string containing mentions
 * @param {number[]} userIds - An array of user IDs corresponding to the mentions
 * @param {number[]} positions - An array of positions where mentions should be inserted in the text
 * @param {Record<number, string>} userMap - A map of user IDs to display names
 * @returns {string} The modified text string with mentions inserted
 */
export function populateMentions(
    text: string,
    userIds: number[],
    positions: number[],
    userMap: Record<number, string>
) {
    // Validate input arrays have same length
    if (userIds.length !== positions.length) {
        throw new Error(
            "User IDs and positions arrays must have the same length"
        );
    }

    // Create array of mention objects with position and user info
    const mentions = userIds
        .map((userId, index) => ({
            position: positions[index],
            userId,
            displayName: userMap[userId]!,
        }))
        .sort((a, b) => b.position - a.position); // Sort in reverse order to prevent position shifting

    // Create the resulting string by inserting mentions
    let result = text;
    mentions.forEach((mention) => {
        const mentionText = `@${mention.displayName}`;
        result =
            result.slice(0, mention.position) +
            mentionText +
            result.slice(mention.position);
    });

    return result;
}
