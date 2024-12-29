import { Client, IAgentRuntime, elizaLogger } from "@elizaos/core";
import { FarcasterClient } from "./client";
import { FarcasterPostManager } from "./post";
import { FarcasterInteractionManager } from "./interactions";
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

/**
 * FarcasterAgentClient is a class that represents a client for interacting with the Farcaster Agent API.
 * @implements Client
 */
 
export class FarcasterAgentClient implements Client {
    client: FarcasterClient;
    posts: FarcasterPostManager;
    interactions: FarcasterInteractionManager;

    private signerUuid: string;

/**
 * Constructor for initializing the Farcaster Neynar client.
 * 
 * @param {IAgentRuntime} runtime - The agent runtime interface.
 * @param {FarcasterClient} [client] - Optional Farcaster client.
 */
    constructor(
        public runtime: IAgentRuntime,
        client?: FarcasterClient
    ) {
        const cache = new Map<string, any>();

        this.signerUuid = runtime.getSetting("FARCASTER_NEYNAR_SIGNER_UUID")!;

        const neynarConfig = new Configuration({
            apiKey: runtime.getSetting("FARCASTER_NEYNAR_API_KEY")!,
        });

        const neynarClient = new NeynarAPIClient(neynarConfig);

        this.client =
            client ??
            new FarcasterClient({
                runtime,
                ssl: true,
                url:
                    runtime.getSetting("FARCASTER_HUB_URL") ??
                    "hub.pinata.cloud",
                neynar: neynarClient,
                signerUuid: this.signerUuid,
                cache,
            });

        elizaLogger.info("Farcaster Neynar client initialized.");

        this.posts = new FarcasterPostManager(
            this.client,
            this.runtime,
            this.signerUuid,
            cache
        );

        this.interactions = new FarcasterInteractionManager(
            this.client,
            this.runtime,
            this.signerUuid,
            cache
        );
    }

/**
 * Asynchronously starts the posts and interactions services.
 */
    async start() {
        await Promise.all([this.posts.start(), this.interactions.start()]);
    }

/**
 * Asynchronously stops the process of both stopping the posts and interactions.
 */
```
    async stop() {
        await Promise.all([this.posts.stop(), this.interactions.stop()]);
    }
}
