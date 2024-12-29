import {
    elizaLogger,
    getEmbeddingZeroVector,
    IAgentRuntime,
    stringToUuid,
    type Memory,
    type UUID,
} from "@elizaos/core";
import type { Cast } from "./types";
import { toHex } from "viem";
import { castUuid } from "./utils";
import { FarcasterClient } from "./client";

/**
 * Creates a memory object based on the provided cast information.
 * @param {Object} params - The parameters for creating the memory.
 * @param {UUID} params.roomId - The UUID of the room.
 * @param {IAgentRuntime} params.runtime - The agent runtime.
 * @param {Cast} params.cast - The cast object.
 * @returns {Memory} The created memory object.
 */
export function createCastMemory({
    roomId,
    runtime,
    cast,
}: {
    roomId: UUID;
    runtime: IAgentRuntime;
    cast: Cast;
}): Memory {
    const inReplyTo = cast.inReplyTo
        ? castUuid({
              hash: toHex(cast.inReplyTo.hash),
              agentId: runtime.agentId,
          })
        : undefined;

    return {
        id: castUuid({
            hash: cast.hash,
            agentId: runtime.agentId,
        }),
        agentId: runtime.agentId,
        userId: runtime.agentId,
        content: {
            text: cast.text,
            source: "farcaster",
            url: "",
            inReplyTo,
            hash: cast.hash,
        },
        roomId,
        embedding: getEmbeddingZeroVector(),
    };
}

/**
 * Builds a conversation thread by recursively processing the given Cast object and its parent Cast objects.
 * 
 * @param {Object} params - The parameters for building the conversation thread.
 * @param {Cast} params.cast - The initial Cast object to start building the thread from.
 * @param {IAgentRuntime} params.runtime - The runtime object providing access to Farcaster's message manager.
 * @param {FarcasterClient} params.client - The client object for interacting with Farcaster's API.
 * 
 * @returns {Promise<Cast[]>} A Promise that resolves with an array of Cast objects representing the conversation thread.
 */
export async function buildConversationThread({
    cast,
    runtime,
    client,
}: {
    cast: Cast;
    runtime: IAgentRuntime;
    client: FarcasterClient;
}): Promise<Cast[]> {
    const thread: Cast[] = [];
    const visited: Set<string> = new Set();
    async function processThread(currentCast: Cast) {
        if (visited.has(currentCast.hash)) {
            return;
        }

        visited.add(currentCast.hash);

        const roomId = castUuid({
            hash: currentCast.hash,
            agentId: runtime.agentId,
        });

        // Check if the current cast has already been saved
        const memory = await runtime.messageManager.getMemoryById(roomId);

        if (!memory) {
            elizaLogger.log("Creating memory for cast", currentCast.hash);

            const userId = stringToUuid(currentCast.profile.username);

            await runtime.ensureConnection(
                userId,
                roomId,
                currentCast.profile.username,
                currentCast.profile.name,
                "farcaster"
            );

            await runtime.messageManager.createMemory(
                createCastMemory({
                    roomId,
                    runtime,
                    cast: currentCast,
                })
            );
        }

        thread.unshift(currentCast);

        if (currentCast.inReplyTo) {
            const parentCast = await client.getCast(currentCast.inReplyTo.hash);
            await processThread(parentCast);
        }
    }

    await processThread(cast);
    return thread;
}
