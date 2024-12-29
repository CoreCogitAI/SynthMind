import { Client, IAgentRuntime, elizaLogger } from "@elizaos/core";

/**
 * Represents an AutoClient that runs a task at intervals.
 * @class
 */
      
export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;

/**
 * Constructor for AutoClient class.
 * Initializes an instance of AutoClient with the given runtime.
 * 
 * @param {IAgentRuntime} runtime - The runtime object for the agent.
 */
    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        // start a loop that runs every x seconds
        this.interval = setInterval(
            async () => {
                elizaLogger.log("running auto client...");
            },
            60 * 60 * 1000
        ); // 1 hour in milliseconds
    }
}

export const AutoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const client = new AutoClient(runtime);
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Direct client does not support stopping yet");
    },
};

export default AutoClientInterface;
