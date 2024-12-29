import {
    elizaLogger,
    getEmbeddingZeroVector,
    IAgentRuntime,
    stringToUuid,
    type Memory,
    type UUID,
} from "@elizaos/core";
import { publicationUuid } from "./utils";
import { LensClient } from "./client";
import { AnyPublicationFragment } from "@lens-protocol/client";

/**
 * Creates a memory object based on the provided publication data.
 *
 * @param {Object} params - The parameters for creating the memory object.
 * @param {UUID} params.roomId - The UUID of the room where the memory is created.
 * @param {IAgentRuntime} params.runtime - The runtime information of the agent.
 * @param {AnyPublicationFragment} params.publication - The publication data used to create the memory.
 * @returns {Memory} The memory object created based on the publication data.
 */
export function createPublicationMemory({
    roomId,
    runtime,
    publication,
}: {
    roomId: UUID;
    runtime: IAgentRuntime;
    publication: AnyPublicationFragment;
}): Memory {
    const commentOn = publication.commentOn
        ? publicationUuid({
              pubId: publication.commentOn.id,
              agentId: runtime.agentId,
          })
        : undefined;

    return {
        id: publicationUuid({
            pubId: publication.id,
            agentId: runtime.agentId,
        }),
        agentId: runtime.agentId,
        userId: runtime.agentId,
        content: {
            text: publication.metadata.content,
            source: "lens",
            url: "",
            commentOn,
            id: publication.id,
        },
        roomId,
        embedding: getEmbeddingZeroVector(),
    };
}

/**
 * Builds a conversation thread starting from a given publication.
 * 
 * @param {Object} params - The parameters object.
 * @param {AnyPublicationFragment} params.publication - The publication from which to start building the thread.
 * @param {IAgentRuntime} params.runtime - The agent runtime.
 * @param {LensClient} params.client - The client for interacting with the Lens API.
 * @returns {Promise<AnyPublicationFragment[]>} - The conversation thread built from the given publication.
 */
export async function buildConversationThread({
    publication,
    runtime,
    client,
}: {
    publication: AnyPublicationFragment;
    runtime: IAgentRuntime;
    client: LensClient;
}): Promise<AnyPublicationFragment[]> {
    const thread: AnyPublicationFragment[] = [];
    const visited: Set<string> = new Set();
    async function processThread(currentPublication: AnyPublicationFragment) {
        if (visited.has(currentPublication.id)) {
            return;
        }

        visited.add(currentPublication.id);

        const roomId = publicationUuid({
            pubId: currentPublication.id,
            agentId: runtime.agentId,
        });

        // Check if the current cast has already been saved
        const memory = await runtime.messageManager.getMemoryById(roomId);

        if (!memory) {
            elizaLogger.log(
                "Creating memory for publication",
                currentPublication.id
            );

            const userId = stringToUuid(currentPublication.by.id);

            await runtime.ensureConnection(
                userId,
                roomId,
                currentPublication.by.id,
                currentPublication.by.metadata?.displayName ||
                    currentPublication.by.handle?.localName,
                "lens"
            );

            await runtime.messageManager.createMemory(
                createPublicationMemory({
                    roomId,
                    runtime,
                    publication: currentPublication,
                })
            );
        }

        thread.unshift(currentPublication);

        if (currentPublication.commentOn) {
            const parentPublication = await client.getPublication(
                currentPublication.commentOn.id
            );
            if (parentPublication) await processThread(parentPublication);
        }
    }

    await processThread(publication);
    return thread;
}
