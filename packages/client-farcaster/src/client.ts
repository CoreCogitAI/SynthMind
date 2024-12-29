import { IAgentRuntime, elizaLogger } from "@elizaos/core";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";
import { NeynarCastResponse, Cast, Profile, FidRequest, CastId } from "./types";

/**
 * Represents a client for interacting with the Farcaster API.
 *
 * @class
 */
 */
export class FarcasterClient {
    runtime: IAgentRuntime;
    neynar: NeynarAPIClient;
    signerUuid: string;
    cache: Map<string, any>;
    lastInteractionTimestamp: Date;

/**
 * Constructor for creating a new instance of the class.
 * @param {Object} opts - The options object.
 * @param {IAgentRuntime} opts.runtime - The agent runtime.
 * @param {string} opts.url - The URL.
 * @param {boolean} opts.ssl - The SSL flag.
 * @param {NeynarAPIClient} opts.neynar - The Neynar API client.
 * @param {string} opts.signerUuid - The signer UUID.
 * @param {Map<string, any>} opts.cache - The cache map.
 */
       
    constructor(opts: {
        runtime: IAgentRuntime;
        url: string;
        ssl: boolean;
        neynar: NeynarAPIClient;
        signerUuid: string;
        cache: Map<string, any>;
    }) {
        this.cache = opts.cache;
        this.runtime = opts.runtime;
        this.neynar = opts.neynar;
        this.signerUuid = opts.signerUuid;
        this.lastInteractionTimestamp = new Date();
    }

/**
 * Loads Cast data from Neynar response.
 * 
 * @param {any} neynarResponse The Neynar response data to load Cast from.
 * @returns {Promise<Cast>} The loaded Cast object.
 */
    async loadCastFromNeynarResponse(neynarResponse: any): Promise<Cast> {
        const profile = await this.getProfile(neynarResponse.author.fid);
        return {
            hash: neynarResponse.hash,
            authorFid: neynarResponse.author.fid,
            text: neynarResponse.text,
            profile,
            ...(neynarResponse.parent_hash
                ? {
                      inReplyTo: {
                          hash: neynarResponse.parent_hash,
                          fid: neynarResponse.parent_author.fid,
                      },
                  }
                : {}),
            timestamp: new Date(neynarResponse.timestamp),
        };
    }

/**
 * Publishes a new cast with the specified text.
 * If a parent cast ID is provided, the new cast will be a reply to the parent cast.
 * Optionally specify the number of times to retry the operation if it fails.
 * 
 * @param {string} cast - The text of the cast to publish.
 * @param {CastId | undefined} parentCastId - The ID of the parent cast, if the new cast is a reply.
 * @param {number} [retryTimes] - The number of times to retry in case of failure.
 * @returns {Promise<NeynarCastResponse | undefined>} - A promise resolving to the newly published cast details.
 */
    async publishCast(
        cast: string,
        parentCastId: CastId | undefined,
        retryTimes?: number
    ): Promise<NeynarCastResponse | undefined> {
        try {
            const result = await this.neynar.publishCast({
                signerUuid: this.signerUuid,
                text: cast,
                parent: parentCastId?.hash,
            });
            if (result.success) {
                return {
                    hash: result.cast.hash,
                    authorFid: result.cast.author.fid,
                    text: result.cast.text,
                };
            }
        } catch (err) {
            if (isApiErrorResponse(err)) {
                elizaLogger.error("Neynar error: ", err.response.data);
                throw err.response.data;
            } else {
                elizaLogger.error("Error: ", err);
                throw err;
            }
        }
    }

/**
* Retrieves information about a cast based on the provided cast hash.
* If the cast information is already cached, it returns the cached information.
* If not cached, it queries the Neynar service to fetch the cast information.
* @param {string} castHash - The hash representing the cast to fetch.
* @returns {Promise<Cast>} - A Promise that resolves to the Cast object with the information retrieved.
*/
    async getCast(castHash: string): Promise<Cast> {
        if (this.cache.has(`farcaster/cast/${castHash}`)) {
            return this.cache.get(`farcaster/cast/${castHash}`);
        }

        const response = await this.neynar.lookupCastByHashOrWarpcastUrl({
            identifier: castHash,
            type: "hash",
        });
        const cast = {
            hash: response.cast.hash,
            authorFid: response.cast.author.fid,
            text: response.cast.text,
            profile: {
                fid: response.cast.author.fid,
                name: response.cast.author.display_name || "anon",
                username: response.cast.author.username,
            },
            ...(response.cast.parent_hash
                ? {
                      inReplyTo: {
                          hash: response.cast.parent_hash,
                          fid: response.cast.parent_author.fid,
                      },
                  }
                : {}),
            timestamp: new Date(response.cast.timestamp),
        };

        this.cache.set(`farcaster/cast/${castHash}`, cast);

        return cast;
    }

/**
 * Retrieves casts for a specific user based on their FID.
 * 
 * @param {FidRequest} request - The request object containing the FID and page size.
 * @returns {Promise<Cast[]>} - A promise that resolves to an array of Cast objects.
 */
    async getCastsByFid(request: FidRequest): Promise<Cast[]> {
        const timeline: Cast[] = [];

        const response = await this.neynar.fetchCastsForUser({
            fid: request.fid,
            limit: request.pageSize,
        });
        response.casts.map((cast) => {
            this.cache.set(`farcaster/cast/${cast.hash}`, cast);
            timeline.push({
                hash: cast.hash,
                authorFid: cast.author.fid,
                text: cast.text,
                profile: {
                    fid: cast.author.fid,
                    name: cast.author.display_name || "anon",
                    username: cast.author.username,
                },
                timestamp: new Date(cast.timestamp),
            });
        });

        return timeline;
    }

/**
 * Retrieves mentions and replies for a given FID.
 * 
 * @param {FidRequest} request - The FID request object containing the FID to fetch mentions for.
 * @returns {Promise<Cast[]>} - A promise that resolves with an array of Cast objects representing mentions and replies.
 */
    async getMentions(request: FidRequest): Promise<Cast[]> {
        const neynarMentionsResponse = await this.neynar.fetchAllNotifications({
            fid: request.fid,
            type: ["mentions", "replies"],
        });
        const mentions: Cast[] = [];

        neynarMentionsResponse.notifications.map((notification) => {
            const cast = {
                hash: notification.cast!.hash,
                authorFid: notification.cast!.author.fid,
                text: notification.cast!.text,
                profile: {
                    fid: notification.cast!.author.fid,
                    name: notification.cast!.author.display_name || "anon",
                    username: notification.cast!.author.username,
                },
                ...(notification.cast!.parent_hash
                    ? {
                          inReplyTo: {
                              hash: notification.cast!.parent_hash,
                              fid: notification.cast!.parent_author.fid,
                          },
                      }
                    : {}),
                timestamp: new Date(notification.cast!.timestamp),
            };
            mentions.push(cast);
            this.cache.set(`farcaster/cast/${cast.hash}`, cast);
        });

        return mentions;
    }

/**
 * Asynchronously retrieves a user's profile based on the given fid.
 * If the profile is found in the cache, it is returned directly.
 * Otherwise, it fetches the user's profile data using Neynar's fetchBulkUsers method.
 *
 * @param {number} fid - The fid of the user whose profile is to be retrieved.
 * @return {Promise<Profile>} The profile object of the user.
 * @throws {string} Throws an error if there is an issue fetching the user's profile.
 */
    async getProfile(fid: number): Promise<Profile> {
        if (this.cache.has(`farcaster/profile/${fid}`)) {
            return this.cache.get(`farcaster/profile/${fid}`) as Profile;
        }

        const result = await this.neynar.fetchBulkUsers({ fids: [fid] });
        if (!result.users || result.users.length < 1) {
            elizaLogger.error("Error fetching user by fid");

            throw "getProfile ERROR";
        }

        const neynarUserProfile = result.users[0];

        const profile: Profile = {
            fid,
            name: "",
            username: "",
        };

        const userDataBodyType = {
            1: "pfp",
            2: "name",
            3: "bio",
            5: "url",
            6: "username",
            // 7: "location",
            // 8: "twitter",
            // 9: "github",
        } as const;

        profile.name = neynarUserProfile.display_name!;
        profile.username = neynarUserProfile.username;
        profile.bio = neynarUserProfile.profile.bio.text;
        profile.pfp = neynarUserProfile.pfp_url;

        this.cache.set(`farcaster/profile/${fid}`, profile);

        return profile;
    }

/**
 * Get a timeline of Cast objects for a given Fid.
 * @param {FidRequest} request - The request object containing the Fid.
 * @returns {Promise<{timeline: Cast[]; nextPageToken?: Uint8Array | undefined;}>} - An object containing the timeline of Cast objects and an optional nextPageToken for paging.
 */
    async getTimeline(request: FidRequest): Promise<{
        timeline: Cast[];
        nextPageToken?: Uint8Array | undefined;
    }> {
        const timeline: Cast[] = [];

        const results = await this.getCastsByFid(request);

        for (const cast of results) {
            this.cache.set(`farcaster/cast/${cast.hash}`, cast);
            timeline.push(cast);
        }

        return {
            timeline,
            //TODO implement paging
            //nextPageToken: results.nextPageToken,
        };
    }
}
