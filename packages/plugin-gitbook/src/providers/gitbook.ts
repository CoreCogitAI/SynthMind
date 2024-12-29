import {
    Provider,
    IAgentRuntime,
    Memory,
    State,
    elizaLogger,
} from "@elizaos/core";
import { GitBookResponse, GitBookClientConfig } from "../types";

/**
 * Cleans up text by removing Discord mentions, channels, roles, and platform mentions.
 * 
 * @param {string} text - The text to be cleaned up.
 * @returns {string} The cleaned up text.
 */
function cleanText(text: string): string {
    const cleaned = text
        .replace(/<@!?\d+>/g, "") // Discord mentions
        .replace(/<#\d+>/g, "") // Discord channels
        .replace(/<@&\d+>/g, "") // Discord roles
        .replace(/(?:^|\s)@[\w_]+/g, "") // Platform mentions
        .trim();

    return cleaned;
}

/**
 * Validates the query text based on project terms, document triggers, and general queries.
 * 
 * @param {IAgentRuntime} runtime The agent runtime object.
 * @param {string} text The query text to validate.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the query is valid.
 */ 
async function validateQuery(
    runtime: IAgentRuntime,
    text: string
): Promise<boolean> {
    // Default general queries - everything else comes from config
    const keywords = {
        generalQueries: [
            "how",
            "what",
            "where",
            "explain",
            "show",
            "tell",
            "can",
            "does",
            "is",
            "are",
            "will",
            "why",
            "benefits",
            "features",
            "cost",
            "price",
            "use",
            "using",
            "work",
            "access",
            "get",
        ],
    };

    try {
        const gitbookConfig = runtime.character.clientConfig
            ?.gitbook as GitBookClientConfig;

        // Get project terms and document triggers from config
        const projectTerms = gitbookConfig?.keywords?.projectTerms || [];
        const documentTriggers = gitbookConfig?.documentTriggers || [];

        // Merge any additional general queries from config
        if (gitbookConfig?.keywords?.generalQueries) {
            keywords.generalQueries = [
                ...keywords.generalQueries,
                ...gitbookConfig.keywords.generalQueries,
            ];
        }

        const containsAnyWord = (text: string, words: string[] = []) => {
            return (
                words.length === 0 ||
                words.some((word) => {
                    if (word.includes(" ")) {
                        return text.includes(word.toLowerCase());
                    }
                    const regex = new RegExp(`\\b${word}\\b`, "i");
                    return regex.test(text);
                })
            );
        };

        const hasProjectTerm = containsAnyWord(text, projectTerms);
        const hasDocTrigger = containsAnyWord(text, documentTriggers);
        const hasGeneralQuery = containsAnyWord(text, keywords.generalQueries);

        const isValid = hasProjectTerm || hasDocTrigger || hasGeneralQuery;

        elizaLogger.info(`✅ Is GitBook Validation Result: ${isValid}`);
        return isValid;
    } catch (error) {
        elizaLogger.warn(`❌ Error in GitBook validation:\n${error}`);
        return false;
    }
}

export const gitbookProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State
    ): Promise<string> => {
        try {
            const spaceId = runtime.getSetting("GITBOOK_SPACE_ID");
            if (!spaceId) {
                elizaLogger.error("⚠️ GitBook Space ID not configured");
                return "";
            }

            const text = message.content.text.toLowerCase().trim();
            const isValidQuery = await validateQuery(runtime, text);

            if (!isValidQuery) {
                elizaLogger.info("⚠️ GitBook Query validation failed");
                return "";
            }

            const cleanedQuery = cleanText(message.content.text);

            const response = await fetch(
                `https://api.gitbook.com/v1/spaces/${spaceId}/search/ask`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: cleanedQuery,
                        variables: {},
                    }),
                }
            );

            if (!response.ok) {
                elizaLogger.error("❌ GitBook API error:", response.status);
                return "";
            }

            const result: GitBookResponse = await response.json();

            return result.answer?.text || "";
        } catch (error) {
            elizaLogger.error("❌ Error in GitBook provider:", error);
            return "";
        }
    },
};
