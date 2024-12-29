import type { LensClient } from "./client";
import {
    elizaLogger,
    type Content,
    type IAgentRuntime,
    type Memory,
    type UUID,
} from "@elizaos/core";
import { textOnly } from "@lens-protocol/metadata";
import { createPublicationMemory } from "./memory";
import { AnyPublicationFragment } from "@lens-protocol/client";
import StorjProvider from "./providers/StorjProvider";

/**
 * Sends a publication to the Lens platform with the given content and optional comment.
 * 
 * @param {Object} options - The options object.
 * @param {LensClient} options.client - The Lens client instance.
 * @param {IAgentRuntime} options.runtime - The Agent runtime.
 * @param {Content} options.content - The content to be published.
 * @param {UUID} options.roomId - The ID of the room where the publication is being sent.
 * @param {string} [options.commentOn] - Optional comment to be associated with the publication.
 * @param {StorjProvider} options.ipfs - The StorjProvider for content hosting.
 * @returns {Promise<Object>} A promise that resolves to an object with optional 'memory' and 'publication' properties.
 */
export async function sendPublication({
    client,
    runtime,
    content,
    roomId,
    commentOn,
    ipfs,
}: {
    client: LensClient;
    runtime: IAgentRuntime;
    content: Content;
    roomId: UUID;
    commentOn?: string;
    ipfs: StorjProvider;
}): Promise<{ memory?: Memory; publication?: AnyPublicationFragment }> {
    // TODO: arweave provider for content hosting
    const metadata = textOnly({ content: content.text });
    const contentURI = await ipfs.pinJson(metadata);

    const publication = await client.createPublication(
        contentURI,
        false, // TODO: support collectable settings
        commentOn
    );

    if (publication) {
        return {
            publication,
            memory: createPublicationMemory({
                roomId,
                runtime,
                publication: publication as AnyPublicationFragment,
            }),
        };
    }

    return {};
}
