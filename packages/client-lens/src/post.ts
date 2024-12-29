import {
    composeContext,
    generateText,
    IAgentRuntime,
    ModelClass,
    stringToUuid,
    elizaLogger,
} from "@elizaos/core";
import { LensClient } from "./client";
import { formatTimeline, postTemplate } from "./prompts";
import { publicationUuid } from "./utils";
import { createPublicationMemory } from "./memory";
import { sendPublication } from "./actions";
import StorjProvider from "./providers/StorjProvider";

/**
 * Manages the lens post functionality by periodically generating new publications and 
 * sending them using the LensClient and IAgentRuntime provided during initialization.
 * 
 * @class LensPostManager
export class LensPostManager {
    private timeout: NodeJS.Timeout | undefined;

/**
 * Constructor for creating a new instance of a class.
 * @param {LensClient} client - The LensClient object for communication with the client.
 * @param {IAgentRuntime} runtime - The IAgentRuntime object for runtime access.
 * @param {string} profileId - The ID of the profile.
 * @param {Map<string, any>} cache - The cache object for storing data.
 * @param {StorjProvider} ipfs - The StorjProvider object for IPFS functionality.
 */
    constructor(
        public client: LensClient,
        public runtime: IAgentRuntime,
        private profileId: string,
        public cache: Map<string, any>,
        private ipfs: StorjProvider
    ) {}

/**
 * Asynchronously starts the publication generation loop.
 * 
 * This method generates a new publication using the 'generateNewPublication' method in a loop with a random interval between 1 and 4 hours.
 * Any errors that occur during publication generation are logged using 'elizaLogger.error'.
 */
    public async start() {
        const generateNewPubLoop = async () => {
            try {
                await this.generateNewPublication();
            } catch (error) {
                elizaLogger.error(error);
                return;
            }

            this.timeout = setTimeout(
                generateNewPubLoop,
                (Math.floor(Math.random() * (4 - 1 + 1)) + 1) * 60 * 60 * 1000
            ); // Random interval between 1 and 4 hours
        };

        generateNewPubLoop();
    }

/**
 * Stops the operation by clearing the timeout if it exists.
 */
    public async stop() {
        if (this.timeout) clearTimeout(this.timeout);
    }

/**
 * Asynchronously generates a new publication for the agent.
 * - Retrieves the profile of the agent using the profileId
 * - Ensures the user exists in the runtime with the necessary details
 * - Retrieves the timeline for the profile
 * - Formats the home timeline for the agent
 * - Composes the state for the new publication
 * - Generates the content for the publication based on the context and template
 * - Sends the publication to the room specified
 * - Creates a memory for the publication in the message manager
 * 
 * @returns {Promise<void>} A promise that resolves once the new publication is generated
 */
    private async generateNewPublication() {
        elizaLogger.info("Generating new publication");
        try {
            const profile = await this.client.getProfile(this.profileId);
            await this.runtime.ensureUserExists(
                this.runtime.agentId,
                profile.handle!,
                this.runtime.character.name,
                "lens"
            );

            const timeline = await this.client.getTimeline(this.profileId);

            // this.cache.set("lens/timeline", timeline);

            const formattedHomeTimeline = formatTimeline(
                this.runtime.character,
                timeline
            );

            const generateRoomId = stringToUuid("lens_generate_room");

            const state = await this.runtime.composeState(
                {
                    roomId: generateRoomId,
                    userId: this.runtime.agentId,
                    agentId: this.runtime.agentId,
                    content: { text: "", action: "" },
                },
                {
                    lensHandle: profile.handle,
                    timeline: formattedHomeTimeline,
                }
            );

            const context = composeContext({
                state,
                template:
                    this.runtime.character.templates?.lensPostTemplate ||
                    postTemplate,
            });

            const content = await generateText({
                runtime: this.runtime,
                context,
                modelClass: ModelClass.SMALL,
            });

            if (this.runtime.getSetting("LENS_DRY_RUN") === "true") {
                elizaLogger.info(`Dry run: would have posted: ${content}`);
                return;
            }

            try {
                const { publication } = await sendPublication({
                    client: this.client,
                    runtime: this.runtime,
                    roomId: generateRoomId,
                    content: { text: content },
                    ipfs: this.ipfs,
                });

                if (!publication) throw new Error("failed to send publication");

                const roomId = publicationUuid({
                    agentId: this.runtime.agentId,
                    pubId: publication.id,
                });

                await this.runtime.ensureRoomExists(roomId);

                await this.runtime.ensureParticipantInRoom(
                    this.runtime.agentId,
                    roomId
                );

                elizaLogger.info(`[Lens Client] Published ${publication.id}`);

                await this.runtime.messageManager.createMemory(
                    createPublicationMemory({
                        roomId,
                        runtime: this.runtime,
                        publication,
                    })
                );
            } catch (error) {
                elizaLogger.error("Error sending publication:", error);
            }
        } catch (error) {
            elizaLogger.error("Error generating new publication:", error);
        }
    }
}
