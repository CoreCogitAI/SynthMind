import { Plugin } from "@elizaos/eliza";

import { birdeyeProvider, BirdeyeProvider } from "./providers/birdeye";

export { BirdeyeProvider };

export const birdeyePlugin: Plugin = {
    name: "birdeye",
    description: "Birdeye Plugin for Eliza",
    providers: [birdeyeProvider],
};

export default birdeyePlugin;
