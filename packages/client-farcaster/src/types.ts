/**
 * Represents a user profile.
 * @typedef {Object} Profile
 * @property {number} fid - The unique identifier for the profile.
 * @property {string} name - The name of the user.
 * @property {string} username - The username of the user.
 * @property {string} [pfp] - The profile picture URL of the user.
 * @property {string} [bio] - The bio of the user.
 * @property {string} [url] - The URL associated with the user.
 */
export type Profile = {
    fid: number;
    name: string;
    username: string;
    pfp?: string;
    bio?: string;
    url?: string;
    // location?: string;
    // twitter?: string;
    // github?: string;
};

/**
 * Defines the structure of the response object from the Neynar Cast API.
 * @typedef {Object} NeynarCastResponse
 * @property {string} hash - The unique identifier for the response.
 * @property {number} authorFid - The author's unique identifier.
 * @property {string} text - The text content of the response.
 */
export type NeynarCastResponse = {
    hash: string;
    authorFid: number;
    text: string;
};

/**
 * Represents a cast, which is a post created by a user.
 * @typedef {Object} Cast
 * @property {string} hash - The unique identifier for the cast
 * @property {number} authorFid - The user ID of the author of the cast
 * @property {string} text - The content of the cast
 * @property {Profile} profile - The profile of the author of the cast
 * @property {Object} [inReplyTo] - The optional object representing the cast being replied to
 * @property {string} inReplyTo.hash - The hash of the original cast being replied to
 * @property {number} inReplyTo.fid - The user ID of the original author of the cast being replied to
 * @property {Date} timestamp - The timestamp when the cast was created
 */
       
export type Cast = {
    hash: string;
    authorFid: number;
    text: string;
    profile: Profile;
    inReplyTo?: {
        hash: string;
        fid: number;
    };
    timestamp: Date;
};

/**
 * Definition of a CastId type containing a hash string and a fid number.
 */
export type CastId = {
    hash: string;
    fid: number;
};

/**
 * A type representing a request for fetching data based on a specific fid and page size.
 * @typedef {Object} FidRequest
 * @property {number} fid - The fid value for the request
 * @property {number} pageSize - The number of items to be returned per page
 */
export type FidRequest = {
    fid: number;
    pageSize: number;
};
