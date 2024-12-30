import { InMemoryKey, Wallet } from "../sdk";
import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { NetworkName, BitcoinPrice } from "../types";

export class BitcoinTaprootProvider implements Provider {
    private wallet: InstanceType<typeof Wallet>;
    protected networkName: NetworkName;

    constructor(config: {
        privateKey: string;
        network: NetworkName;
        arkServerPublicKey?: string;
        arkServerUrl?: string;
    }) {
        const identity = InMemoryKey.fromHex(config.privateKey);
        this.networkName = config.network;

        this.wallet = new Wallet({
            identity,
            network: config.network,
            arkServerPublicKey: config.arkServerPublicKey,
            arkServerUrl: config.arkServerUrl,
        });
    }

    async get(
        _runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> {
        try {
            const { onchain, offchain } = await this.wallet.getAddress();
            return `Bitcoin Address: ${onchain}${offchain ? `\nArk Address: ${offchain}` : ""}`;
        } catch (error) {
            console.error("Error getting addresses:", error);
            return null;
        }
    }

    async getAddress() {
        return this.wallet.getAddress();
    }

    async getWalletBalance() {
        return this.wallet.getBalance();
    }

    async getBitcoinPrice(): Promise<BitcoinPrice> {
        try {
            const response = await fetch("https://blockchain.info/ticker");
            if (!response.ok) {
                throw new Error("Failed to fetch Bitcoin price");
            }
            return response.json();
        } catch (error) {
            console.error("Error fetching Bitcoin price:", error);
            throw error;
        }
    }

    async getCoins() {
        try {
            const coins = await this.wallet.getCoins();
            return coins;
        } catch (error) {
            console.error("Error getting coins:", error);
            throw error;
        }
    }

    async getVirtualCoins() {
        return this.wallet.getVirtualCoins();
    }

    async sendBitcoin(params: {
        address: string;
        amount: bigint;
        message?: string;
    }) {
        return this.wallet.sendBitcoin({
            address: params.address,
            amount: Number(params.amount),
        });
    }

    async signMessage(message: string) {
        return this.wallet.signMessage(message);
    }

    async verifyMessage(message: string, signature: string, address: string) {
        return this.wallet.verifyMessage(message, signature, address);
    }

    getCurrentNetwork() {
        return { name: this.networkName };
    }

    async dispose() {
        this.wallet.dispose();
    }
}

export const bitcoinProvider: Provider = {
    async get(
        runtime: IAgentRuntime,
        message: Memory,
        state?: State
    ): Promise<string | null> {
        try {
            const privateKey = runtime.getSetting("BITCOIN_PRIVATE_KEY");
            const network =
                runtime.getSetting("BITCOIN_NETWORK") || "mutinynet";
            const arkServerUrl = runtime.getSetting("BITCOIN_ARK_SERVER_URL");
            const arkServerPubKey = runtime.getSetting(
                "BITCOIN_ARK_SERVER_PUBLIC_KEY"
            );

            if (!privateKey) {
                throw new Error(
                    "BITCOIN_PRIVATE_KEY environment variable is missing"
                );
            }

            const provider = new BitcoinTaprootProvider({
                privateKey: String(privateKey),
                network: network as NetworkName,
                arkServerPublicKey: arkServerPubKey
                    ? String(arkServerPubKey)
                    : undefined,
            });

            return provider.get(runtime, message, state);
        } catch (error) {
            console.error("Error in Bitcoin provider:", error);
            return null;
        }
    },
};
