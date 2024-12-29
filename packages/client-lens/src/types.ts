/**
 * Represents a user profile.
 * @typedef {Object} Profile
 * @property {string} id - The ID of the profile.
 * @property {string} profileId - The profile ID of the user.
 * @property {string|null} [name] - The name of the user.
 * @property {string} [handle] - The handle of the user.
 * @property {string} [pfp] - The profile picture of the user.
 * @property {string|null} [bio] - The biography of the user.
 * @property {string} [url] - The URL of the user's profile.
 */
export type Profile = {
    id: string;
    profileId: string;
    name?: string | null;
    handle?: string;
    pfp?: string;
    bio?: string | null;
    url?: string;
};

/**
 * Definition of the BroadcastResult type.
 * @typedef {Object} BroadcastResult
 * @property {string} [id] - The id of the broadcast result.
 * @property {string} [txId] - The transaction id of the broadcast result.
 */
export type BroadcastResult = {
    id?: string;
    txId?: string;
};
