export * from "./providers/bitcoin";
export * from "./actions/balance";
export * from "./actions/coins";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { balanceAction } from "./actions/balance";
import { coinsAction } from "./actions/coins";
import { bitcoinProvider } from "./providers/bitcoin";
import { sendBitcoinAction } from "./actions/send";
import { showBitcoinAddressesAction } from "./actions/addresses";

export const bitcoinPlugin: Plugin = {
    name: "bitcoin",
    description:
        "Bitcoin blockchain integration plugin with Ark protocol support",
    providers: [bitcoinProvider],
    evaluators: [],
    services: [],
    actions: [
        showBitcoinAddressesAction,
        balanceAction,
        coinsAction,
        sendBitcoinAction,
    ],
};
