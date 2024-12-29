import type { FarcasterClient } from "./client";
import type { Content, IAgentRuntime, Memory, UUID } from "@elizaos/core";
import type { Cast, CastId, Profile } from "./types";
import { createCastMemory } from "./memory";
import { splitPostContent } from "./utils";

/**
 * Sends a cast to a room with optional in-reply-to information.
 * 
 * @param {Object} params - The parameters for sending the cast.
 * @param {Profile} params.profile - The profile of the sender.
 * @param {FarcasterClient} params.client - The Farcaster client for publishing the cast.
 * @param {IAgentRuntime} params.runtime - The runtime environment.
 * @param {Content} params.content - The content of the cast.
 * @param {UUID} params.roomId - The ID of the room where the cast will be sent.
 * @param {string} params.signerUuid - The UUID of the signer.
 * @param {CastId} [params.inReplyTo] - The ID of the cast being replied to.
 * @returns {Promise<{ memory: Memory; cast: Cast }[]>} An array of objects containing the memory and cast sent.
 */
export async function sendCast({
    client,
    runtime,
    content,
    roomId,
    inReplyTo,
    profile,
}: {
    profile: Profile;
    client: FarcasterClient;
    runtime: IAgentRuntime;
    content: Content;
    roomId: UUID;
    signerUuid: string;
    inReplyTo?: CastId;
}): Promise<{ memory: Memory; cast: Cast }[]> {
    const chunks = splitPostContent(content.text);
    const sent: Cast[] = [];
    let parentCastId = inReplyTo;

    for (const chunk of chunks) {
        const neynarCast = await client.publishCast(chunk, parentCastId);

        if (neynarCast) {
            const cast: Cast = {
                hash: neynarCast.hash,
                authorFid: neynarCast.authorFid,
                text: neynarCast.text,
                profile,
                inReplyTo: parentCastId,
                timestamp: new Date(),
            };

            sent.push(cast!);

            parentCastId = {
                fid: neynarCast?.authorFid!,
                hash: neynarCast?.hash!,
            };
        }
    }

    return sent.map((cast) => ({
        cast,
        memory: createCastMemory({
            roomId,
            runtime,
            cast,
        }),
    }));
}
