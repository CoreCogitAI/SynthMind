// GitBook API response type
/**
* Interface for representing a response from a GitBook API.
* @typedef {Object} GitBookResponse
* @property {Object} [answer] - Object containing text property with a string value.
* @property {string} [error] - String representing any error message.
*/
export interface GitBookResponse {
    answer?: {
        text: string;
    };
    error?: string;
}

// Client configuration in character.json (all optional)
/**
 * Interface representing keywords related to GitBook.
 * @typedef {object} GitBookKeywords
 * @property {string[]} [projectTerms] - An array of project terms keywords.
 * @property {string[]} [generalQueries] - An array of general queries keywords.
 */
export interface GitBookKeywords {
    projectTerms?: string[];
    generalQueries?: string[];
}

/**
 * Interface for configuring the GitBook client.
 * @typedef {Object} GitBookClientConfig
 * @property {GitBookKeywords} [keywords] - Optional keywords to filter documents
 * @property {string[]} [documentTriggers] - Optional list of triggers for a document
 */
export interface GitBookClientConfig {
    keywords?: GitBookKeywords;
    documentTriggers?: string[];
}