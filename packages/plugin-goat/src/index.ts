import type { Plugin } from "@elizaos/core";
import { getOnChainActions } from "./actions";
import { erc20, USDC } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/core";
import { getWalletClient, getWalletProvider } from "./wallet";

/**
 * Creates a Goat Plugin with the specified configuration.
 *
 * @param {function(string): string | undefined} getSetting - The function to get the setting based on the key.
 * @returns {Promise<Plugin>} - The newly created Goat Plugin with the specified settings.
 */
async function createGoatPlugin(
    getSetting: (key: string) => string | undefined
): Promise<Plugin> {
    const walletClient = getWalletClient(getSetting);
    const actions = await getOnChainActions({
        wallet: walletClient,
        // Add plugins here based on what actions you want to use
        // See all available plugins at https://ohmygoat.dev/chains-wallets-plugins#plugins
        plugins: [sendETH(), erc20({ tokens: [USDC] })],
    });

    return {
        name: "[GOAT] Onchain Actions",
        description: "Base integration plugin",
        providers: [getWalletProvider(walletClient)],
        evaluators: [],
        services: [],
        actions: actions,
    };
}

export default createGoatPlugin;
