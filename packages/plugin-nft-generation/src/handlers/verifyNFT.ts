import { IAgentRuntime } from "@elizaos/core";
import { PublicKey } from "@solana/web3.js";
import WalletSolana from "../provider/wallet/walletSolana.ts";

/**
 * Verifies NFT ownership for a given NFT address within a collection.
 * 
 * @param {Object} params - The parameters for verifying NFT ownership.
 * @param {IAgentRuntime} params.runtime - The runtime for the agent.
 * @param {string} params.collectionAddress - The address of the NFT collection.
 * @param {string} params.NFTAddress - The address of the NFT to verify.
 * @returns {Promise<{ success: boolean }>} A promise that resolves to an object with a boolean value indicating the success of the verification.
 */
export async function verifyNFT({
    runtime,
    collectionAddress,
    NFTAddress,
}: {
    runtime: IAgentRuntime;
    collectionAddress: string;
    NFTAddress: string;
}) {
    const adminPublicKey = runtime.getSetting("SOLANA_ADMIN_PUBLIC_KEY");
    const adminPrivateKey = runtime.getSetting("SOLANA_ADMIN_PRIVATE_KEY");
    const adminWallet = new WalletSolana(
        new PublicKey(adminPublicKey),
        adminPrivateKey
    );
    await adminWallet.verifyNft({
        collectionAddress,
        nftAddress: NFTAddress,
    });
    return {
        success: true,
    };
}
