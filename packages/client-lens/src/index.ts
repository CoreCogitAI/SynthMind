import { Client, IAgentRuntime, elizaLogger } from "@elizaos/core";
import { privateKeyToAccount } from "viem/accounts";
import { LensClient } from "./client";
import { LensPostManager } from "./post";
import { LensInteractionManager } from "./interactions";
import StorjProvider from "./providers/StorjProvider";

/**
 * Represents a Lens agent client that interacts with the Lens API using a LensClient, LensPostManager, and LensInteractionManager instances.
 * Manages the client's profile ID, StorjProvider for IPFS, and initiates the LensClient, LensPostManager, and LensInteractionManager by passing necessary parameters.
 * 
 * @implements {Client}
 * @class
 */
export class LensAgentClient implements Client {
    client: LensClient;
    posts: LensPostManager;
    interactions: LensInteractionManager;

    private profileId: `0x${string}`;
    private ipfs: StorjProvider;

/**
 * Constructor for initializing LensService with necessary configurations.
 * @param {IAgentRuntime} runtime - The runtime object for the agent.
 */
    constructor(public runtime: IAgentRuntime) {
        const cache = new Map<string, any>();

        const privateKey = runtime.getSetting(
            "EVM_PRIVATE_KEY"
        ) as `0x${string}`;
        if (!privateKey) {
            throw new Error("EVM_PRIVATE_KEY is missing");
        }
        const account = privateKeyToAccount(privateKey);

        this.profileId = runtime.getSetting(
            "LENS_PROFILE_ID"
        )! as `0x${string}`;

        this.client = new LensClient({
            runtime: this.runtime,
            account,
            cache,
            profileId: this.profileId,
        });

        elizaLogger.info("Lens client initialized.");

        this.ipfs = new StorjProvider(runtime);

        this.posts = new LensPostManager(
            this.client,
            this.runtime,
            this.profileId,
            cache,
            this.ipfs
        );

        this.interactions = new LensInteractionManager(
            this.client,
            this.runtime,
            this.profileId,
            cache,
            this.ipfs
        );
    }

/**
 * Asynchronously starts both the posts and interactions components by awaiting the result of their respective start() methods.
 */
    async start() {
        await Promise.all([this.posts.start(), this.interactions.start()]);
    }

/**
 * Stops the post and interaction processes asynchronously.
 */
    async stop() {
        await Promise.all([this.posts.stop(), this.interactions.stop()]);
    }
}
