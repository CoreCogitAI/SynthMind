import { IAgentRuntime, elizaLogger } from "@elizaos/core";
import {
    AnyPublicationFragment,
    LensClient as LensClientCore,
    production,
    LensTransactionStatusType,
    LimitType,
    NotificationType,
    ProfileFragment,
    PublicationType,
    FeedEventItemType,
} from "@lens-protocol/client";
import { Profile, BroadcastResult } from "./types";
import { PrivateKeyAccount } from "viem";
import { getProfilePictureUri, handleBroadcastResult, omit } from "./utils";

/**
 * LensClient class representing a client for interacting with Lens API.
 * @constructor
 * @param {Object} opts - Options for initializing the LensClient.
 * @param {IAgentRuntime} opts.runtime - The runtime for the client.
 * @param {Map<string, any>} opts.cache - The cache for storing data.
 * @param {PrivateKeyAccount} opts.account - The private key account for authentication.
 * @param {string} opts.profileId - The profile ID for the client.
export class LensClient {
    runtime: IAgentRuntime;
    account: PrivateKeyAccount;
    cache: Map<string, any>;
    lastInteractionTimestamp: Date;
    profileId: `0x${string}`;

    private authenticated: boolean;
    private authenticatedProfile: ProfileFragment | null;
    private core: LensClientCore;

/**
 * Constructs a new LensClient instance.
 * 
 * @param {Object} opts - The options to configure the LensClient.
 * @param {IAgentRuntime} opts.runtime - The IAgentRuntime interface implementation.
 * @param {Map<string, any>} opts.cache - The map used for caching data.
 * @param {PrivateKeyAccount} opts.account - The private key account used for authentication.
 * @param {string} opts.profileId - The profile ID in hexadecimal format.
 */
    constructor(opts: {
        runtime: IAgentRuntime;
        cache: Map<string, any>;
        account: PrivateKeyAccount;
        profileId: `0x${string}`;
    }) {
        this.cache = opts.cache;
        this.runtime = opts.runtime;
        this.account = opts.account;
        this.core = new LensClientCore({
            environment: production,
        });
        this.lastInteractionTimestamp = new Date();
        this.profileId = opts.profileId;
        this.authenticated = false;
        this.authenticatedProfile = null;
    }

/**
 * Asynchronously authenticate the user by generating a challenge, signing the challenge, and sending the signature for verification.
 * If successful, fetch the authenticated profile and set the authenticated flag to true.
 * 
 * @returns {Promise<void>} A Promise that resolves once the authentication process is complete, or rejects with an error
 */
    async authenticate(): Promise<void> {
        try {
            const { id, text } =
                await this.core.authentication.generateChallenge({
                    signedBy: this.account.address,
                    for: this.profileId,
                });

            const signature = await this.account.signMessage({
                message: text,
            });

            await this.core.authentication.authenticate({ id, signature });
            this.authenticatedProfile = await this.core.profile.fetch({
                forProfileId: this.profileId,
            });

            this.authenticated = true;
        } catch (error) {
            elizaLogger.error("client-lens::client error: ", error);
            throw error;
        }
    }

/**
 * Asynchronously creates a publication with the specified content URI.
 *
 * @param {string} contentURI - The content URI for the publication.
 * @param {boolean} onchain - Indicates whether the publication should be created on-chain. Default is false.
 * @param {string} commentOn - Optional. The ID of the publication to comment on.
 * 
 * @returns {Promise<AnyPublicationFragment | null | undefined>} The created publication fragment, or null if not created.
 */
    async createPublication(
        contentURI: string,
        onchain: boolean = false,
        commentOn?: string
    ): Promise<AnyPublicationFragment | null | undefined> {
        try {
            if (!this.authenticated) {
                await this.authenticate();
                elizaLogger.log("done authenticating");
            }
            let broadcastResult;

            if (commentOn) {
                broadcastResult = onchain
                    ? await this.createCommentOnchain(contentURI, commentOn)
                    : await this.createCommentMomoka(contentURI, commentOn);
            } else {
                broadcastResult = onchain
                    ? await this.createPostOnchain(contentURI)
                    : await this.createPostMomoka(contentURI);
            }

            elizaLogger.log("broadcastResult", broadcastResult);

            if (broadcastResult.id) {
                return await this.core.publication.fetch({
                    forId: broadcastResult.id,
                });
            }

            const completion = await this.core.transaction.waitUntilComplete({
                forTxHash: broadcastResult.txHash,
            });

            if (completion?.status === LensTransactionStatusType.Complete) {
                return await this.core.publication.fetch({
                    forTxHash: completion?.txHash,
                });
            }
        } catch (error) {
            elizaLogger.error("client-lens::client error: ", error);
            throw error;
        }
    }

/**
 * Asynchronously retrieves a publication from the cache or the core API.
 * 
 * @param {string} pubId - The ID of the publication to retrieve.
 * @returns {Promise<AnyPublicationFragment | null>} The retrieved publication or null if not found.
 */
    async getPublication(
        pubId: string
    ): Promise<AnyPublicationFragment | null> {
        if (this.cache.has(`lens/publication/${pubId}`)) {
            return this.cache.get(`lens/publication/${pubId}`);
        }

        const publication = await this.core.publication.fetch({ forId: pubId });

        if (publication)
            this.cache.set(`lens/publication/${pubId}`, publication);

        return publication;
    }

/**
 * Fetches publications for a given profile ID with optional limit.
 * 
 * @param {string} profileId - The ID of the profile to retrieve publications for.
 * @param {number} [limit=50] - The maximum number of publications to retrieve. Default is 50.
 * @returns {Promise<AnyPublicationFragment[]>} The array of publications retrieved for the profile.
 */
    async getPublicationsFor(
        profileId: string,
        limit: number = 50
    ): Promise<AnyPublicationFragment[]> {
        const timeline: AnyPublicationFragment[] = [];
        let next: any | undefined = undefined;

        do {
            const { items, next: newNext } = next
                ? await next()
                : await this.core.publication.fetchAll({
                      limit: LimitType.Fifty,
                      where: {
                          from: [profileId],
                          publicationTypes: [PublicationType.Post],
                      },
                  });

            items.forEach((publication) => {
                this.cache.set(
                    `lens/publication/${publication.id}`,
                    publication
                );
                timeline.push(publication);
            });

            next = newNext;
        } while (next && timeline.length < limit);

        return timeline;
    }

/**
 * Asynchronously fetches mentions from the server and returns a Promise with an object containing an array of AnyPublicationFragment mentions and an optional function to retrieve the next set of mentions.
 * 
 * @returns Promise<{
 *     mentions: AnyPublicationFragment[];
 *     next?: () => {};
 * }>
 */
    async getMentions(): Promise<{
        mentions: AnyPublicationFragment[];
        next?: () => {};
    }> {
        if (!this.authenticated) {
            await this.authenticate();
        }
        // TODO: we should limit to new ones or at least latest n
        const result = await this.core.notifications.fetch({
            where: {
                highSignalFilter: false, // true,
                notificationTypes: [
                    NotificationType.Mentioned,
                    NotificationType.Commented,
                ],
            },
        });
        const mentions: AnyPublicationFragment[] = [];

        const { items, next } = result.unwrap();

        items.map((notification) => {
            // @ts-ignore NotificationFragment
            const item = notification.publication || notification.comment;
            if (!item.isEncrypted) {
                mentions.push(item);
                this.cache.set(`lens/publication/${item.id}`, item);
            }
        });

        return { mentions, next };
    }

/**
 * Retrieves a user profile by the given profile ID. If the profile is available in the cache, it is retrieved from there.
 * If not, it is fetched from the core profile service, then stored in the cache for future use.
 * @param {string} profileId - The ID of the profile to retrieve.
 * @returns {Promise<Profile>} The user profile corresponding to the specified profile ID.
 */
    async getProfile(profileId: string): Promise<Profile> {
        if (this.cache.has(`lens/profile/${profileId}`)) {
            return this.cache.get(`lens/profile/${profileId}`) as Profile;
        }

        const result = await this.core.profile.fetch({
            forProfileId: profileId,
        });
        if (!result?.id) {
            elizaLogger.error("Error fetching user by profileId");

            throw "getProfile ERROR";
        }

        const profile: Profile = {
            id: "",
            profileId,
            name: "",
            handle: "",
        };

        profile.id = result.id;
        profile.name = result.metadata?.displayName;
        profile.handle = result.handle?.localName;
        profile.bio = result.metadata?.bio;
        profile.pfp = getProfilePictureUri(result.metadata?.picture);

        this.cache.set(`lens/profile/${profileId}`, profile);

        return profile;
    }

/**
 * Retrieves the timeline of publications for a given profile ID.
 * 
 * @param {string} profileId - The ID of the profile to fetch the timeline for.
 * @param {number} [limit=10] - The maximum number of publications to retrieve. Defaults to 10.
 * @returns {Promise<AnyPublicationFragment[]>} An array of AnyPublicationFragment objects representing the timeline.
 */
    async getTimeline(
        profileId: string,
        limit: number = 10
    ): Promise<AnyPublicationFragment[]> {
        try {
            if (!this.authenticated) {
                await this.authenticate();
            }
            const timeline: AnyPublicationFragment[] = [];
            let next: any | undefined = undefined;

            do {
                const result = next
                    ? await next()
                    : await this.core.feed.fetch({
                          where: {
                              for: profileId,
                              feedEventItemTypes: [FeedEventItemType.Post],
                          },
                      });

                const data = result.unwrap();

                data.items.forEach((item) => {
                    // private posts in orb clubs are encrypted
                    if (timeline.length < limit && !item.root.isEncrypted) {
                        this.cache.set(
                            `lens/publication/${item.id}`,
                            item.root
                        );
                        timeline.push(item.root as AnyPublicationFragment);
                    }
                });

                next = data.pageInfo.next;
            } while (next && timeline.length < limit);

            return timeline;
        } catch (error) {
            console.log(error);
            throw new Error("client-lens:: getTimeline");
        }
    }

/**
 * Creates a post on the blockchain.
 * @param {string} contentURI - The URI of the content to be posted.
 * @returns {Promise<BroadcastResult | undefined>} The broadcast result of the operation, or undefined if the operation fails.
 */
    private async createPostOnchain(
        contentURI: string
    ): Promise<BroadcastResult | undefined> {
        // gasless + signless if they enabled the lens profile manager
        if (this.authenticatedProfile?.signless) {
            const broadcastResult = await this.core.publication.postOnchain({
                contentURI,
                openActionModules: [], // TODO: if collectable
            });
            return handleBroadcastResult(broadcastResult);
        }

        // gasless with signed type data
        const typedDataResult =
            await this.core.publication.createOnchainPostTypedData({
                contentURI,
                openActionModules: [], // TODO: if collectable
            });
        const { id, typedData } = typedDataResult.unwrap();

        const signedTypedData = await this.account.signTypedData({
            domain: omit(typedData.domain as any, "__typename"),
            types: omit(typedData.types, "__typename"),
            primaryType: "Post",
            message: omit(typedData.value, "__typename"),
        });

        const broadcastResult = await this.core.transaction.broadcastOnchain({
            id,
            signature: signedTypedData,
        });
        return handleBroadcastResult(broadcastResult);
    }

/**
 * Creates a post on the Momoka platform either gasless + signless if the authenticated profile has signless enabled,
 * or gasless with signed type data. The post is created using the provided contentURI.
 * 
 * @param {string} contentURI The URI of the content to be posted
 * @returns {Promise<BroadcastResult | undefined>} A Promise that resolves to the broadcast result of the post, or undefined if not successful
 */
    private async createPostMomoka(
        contentURI: string
    ): Promise<BroadcastResult | undefined> {
        console.log("createPostMomoka");
        // gasless + signless if they enabled the lens profile manager
        if (this.authenticatedProfile?.signless) {
            const broadcastResult = await this.core.publication.postOnMomoka({
                contentURI,
            });
            return handleBroadcastResult(broadcastResult);
        }

        // gasless with signed type data
        const typedDataResult =
            await this.core.publication.createMomokaPostTypedData({
                contentURI,
            });
        console.log("typedDataResult", typedDataResult);
        const { id, typedData } = typedDataResult.unwrap();

        const signedTypedData = await this.account.signTypedData({
            domain: omit(typedData.domain as any, "__typename"),
            types: omit(typedData.types, "__typename"),
            primaryType: "Post",
            message: omit(typedData.value, "__typename"),
        });

        const broadcastResult = await this.core.transaction.broadcastOnMomoka({
            id,
            signature: signedTypedData,
        });
        return handleBroadcastResult(broadcastResult);
    }

/**
 * Create a comment on the blockchain for a given content URI.
 * 
 * @param {string} contentURI - The URI of the content to comment on.
 * @param {string} commentOn - The comment to post on the content.
 * @returns {Promise<BroadcastResult | undefined>} A Promise that resolves with the broadcast result of the comment creation or undefined.
 */
    private async createCommentOnchain(
        contentURI: string,
        commentOn: string
    ): Promise<BroadcastResult | undefined> {
        // gasless + signless if they enabled the lens profile manager
        if (this.authenticatedProfile?.signless) {
            const broadcastResult = await this.core.publication.commentOnchain({
                commentOn,
                contentURI,
            });
            return handleBroadcastResult(broadcastResult);
        }

        // gasless with signed type data
        const typedDataResult =
            await this.core.publication.createOnchainCommentTypedData({
                commentOn,
                contentURI,
            });

        const { id, typedData } = typedDataResult.unwrap();

        const signedTypedData = await this.account.signTypedData({
            domain: omit(typedData.domain as any, "__typename"),
            types: omit(typedData.types, "__typename"),
            primaryType: "Comment",
            message: omit(typedData.value, "__typename"),
        });

        const broadcastResult = await this.core.transaction.broadcastOnchain({
            id,
            signature: signedTypedData,
        });
        return handleBroadcastResult(broadcastResult);
    }

/**
 * Creates a comment on a Momoka content.
 * @param {string} contentURI - The URI of the content to comment on.
 * @param {string} commentOn - The ID of the comment to reply to.
 * @returns {Promise<BroadcastResult|undefined>} The result of the broadcast operation, or undefined if the operation failed.
 */
    private async createCommentMomoka(
        contentURI: string,
        commentOn: string
    ): Promise<BroadcastResult | undefined> {
        // gasless + signless if they enabled the lens profile manager
        if (this.authenticatedProfile?.signless) {
            const broadcastResult = await this.core.publication.commentOnMomoka(
                {
                    commentOn,
                    contentURI,
                }
            );
            return handleBroadcastResult(broadcastResult);
        }

        // gasless with signed type data
        const typedDataResult =
            await this.core.publication.createMomokaCommentTypedData({
                commentOn,
                contentURI,
            });

        const { id, typedData } = typedDataResult.unwrap();

        const signedTypedData = await this.account.signTypedData({
            domain: omit(typedData.domain as any, "__typename"),
            types: omit(typedData.types, "__typename"),
            primaryType: "Comment",
            message: omit(typedData.value, "__typename"),
        });

        const broadcastResult = await this.core.transaction.broadcastOnMomoka({
            id,
            signature: signedTypedData,
        });
        return handleBroadcastResult(broadcastResult);
    }
}
