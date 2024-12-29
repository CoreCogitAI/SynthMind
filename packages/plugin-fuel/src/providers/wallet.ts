import type { IAgentRuntime, Provider, Memory, State } from "@elizaos/core";
import { Provider as FuelProvider, Wallet, WalletUnlocked } from "fuels";

/**
 * Class representing a WalletProvider that manages a WalletUnlocked instance.
 */
           
export class WalletProvider {
    wallet: WalletUnlocked;

/**
 * Constructor for creating a new instance of a Wallet.
 * @param privateKey Private key for the wallet in hex format.
 * @param provider FuelProvider used for interacting with the blockchain.
 */
    constructor(privateKey: `0x${string}`, provider: FuelProvider) {
        this.wallet = Wallet.fromPrivateKey(privateKey, provider);
    }

/**
 * Returns the address in base256 format.
 * @returns {string} The address in base256 format.
 */
    getAddress(): string {
        return this.wallet.address.toB256();
    }

/**
 * Asynchronously retrieves the balance from the wallet and formats it.
 * @returns {string} The formatted balance.
 */
    async getBalance() {
        const balance = await this.wallet.getBalance();
        return balance.format();
    }
}

export const initWalletProvider = async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("FUEL_PRIVATE_KEY");
    if (!privateKey) {
        throw new Error("FUEL_PRIVATE_KEY is missing");
    }
    const fuelProviderUrl =
        runtime.getSetting("FUEL_PROVIDER_URL") ||
        "https://mainnet.fuel.network/v1/graphql";

    const provider = await FuelProvider.create(fuelProviderUrl);
    return new WalletProvider(privateKey as `0x${string}`, provider);
};

export const fuelWalletProvider: Provider = {
    async get(
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> {
        const walletProvider = await initWalletProvider(runtime);
        const balance = await walletProvider.getBalance();
        return `Fuel Wallet Address: ${walletProvider.getAddress()}\nBalance: ${balance} ETH`;
    },
};
