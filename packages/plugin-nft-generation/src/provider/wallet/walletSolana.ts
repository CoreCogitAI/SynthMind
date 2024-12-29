import NodeCache from "node-cache";
import {
    Cluster,
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
} from "@solana/web3.js";
import {
    createNft,
    findMetadataPda,
    mplTokenMetadata,
    updateV1,
    verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
    publicKey,
    // sol,
    TransactionBuilder,
    Umi,
} from "@metaplex-foundation/umi";
import { getExplorerLink } from "@solana-developers/helpers";
// import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import bs58 from "bs58";
import { elizaLogger } from "@elizaos/core";

/**
 * Represents a Solana wallet with various functionalities for interacting with the Solana blockchain.
 */
 */
export class WalletSolana {
    private cache: NodeCache;
    private umi: Umi;
    private cluster: Cluster;

/**
 * Constructor for creating a new Wallet instance.
 * @param {PublicKey} walletPublicKey - The public key of the wallet.
 * @param {string} walletPrivateKeyKey - The private key as a string of the wallet.
 * @param {Connection} [connection] - Optional Connection object to use for communication with the Solana cluster.
 */
    constructor(
        private walletPublicKey: PublicKey,
        private walletPrivateKeyKey: string,
        private connection?: Connection
    ) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes

        if (!connection) {
            this.cluster = (process.env.SOLANA_CLUSTER as Cluster) || "devnet";
            this.connection = new Connection(clusterApiUrl(this.cluster), {
                commitment: "finalized",
            });
        }
        const umi = createUmi(this.connection.rpcEndpoint);
        umi.use(mplTokenMetadata());
        const umiUser = umi.eddsa.createKeypairFromSecretKey(
            this.privateKeyUint8Array
        );
        umi.use(keypairIdentity(umiUser));
        this.umi = umi;
    }

/**
 * Asynchronously fetches and returns the balance of the wallet using the specified public key.
 * @returns {Object} An object containing the balance value and the formatted balance in SOL.
 */
    async getBalance() {
        const balance = await this.connection.getBalance(this.walletPublicKey);
        return {
            value: balance,
            formater: `${balance / LAMPORTS_PER_SOL} SOL`,
        };
    }

/**
 * Returns the decoded private key in the form of a Uint8Array.
 */
    get privateKeyUint8Array() {
        return bs58.decode(this.walletPrivateKeyKey);
    }

/**
 * Function to create a new collection of NFTs with specified parameters.
 * @param {object} options - The options for creating the collection.
 * @param {string} options.name - The name of the collection.
 * @param {string} options.symbol - The symbol of the collection.
 * @param {string} options.adminPublicKey - The public key of the admin for the collection.
 * @param {string} options.uri - The URI for the collection.
 * @param {number} options.fee - The fee for the collection.
 * @returns {Promise<{
 *  success: boolean;
 *  link: string;
 *  address: string;
 *  error?: string | null;
 * }>} - The result of the creation operation including success status, link to explorer, address of the collection, and potential error message.
 */
    async createCollection({
        name,
        symbol,
        adminPublicKey,
        uri,
        fee,
    }: {
        name: string;
        symbol: string;
        adminPublicKey: string;
        uri: string;
        fee: number;
    }): Promise<{
        success: boolean;
        link: string;
        address: string;
        error?: string | null;
    }> {
        try {
            const collectionMint = generateSigner(this.umi);
            let transaction = new TransactionBuilder();
            const info = {
                name,
                symbol,
                uri,
            };
            transaction = transaction.add(
                createNft(this.umi, {
                    ...info,
                    mint: collectionMint,
                    sellerFeeBasisPoints: percentAmount(fee),
                    isCollection: true,
                })
            );

            transaction = transaction.add(
                updateV1(this.umi, {
                    mint: collectionMint.publicKey,
                    newUpdateAuthority: publicKey(adminPublicKey), // updateAuthority's public key
                })
            );

            await transaction.sendAndConfirm(this.umi, {
                confirm: {},
            });

            const address = collectionMint.publicKey;
            return {
                success: true,
                link: getExplorerLink("address", address, this.cluster),
                address,
                error: null,
            };
        } catch (e) {
            return {
                success: false,
                link: "",
                address: "",
                error: e.message,
            };
        }
    }

/**
 * Mint a new NFT with the given information.
 * 
 * @param {Object} param0 - The parameters for minting the NFT.
 * @param {string} param0.collectionAddress - The address of the collection.
 * @param {string} param0.adminPublicKey - The public key of the admin.
 * @param {string} param0.name - The name of the NFT.
 * @param {string} param0.symbol - The symbol of the NFT.
 * @param {string} param0.uri - The URI of the NFT.
 * @param {number} param0.fee - The fee for the NFT.
 * 
 * @returns {Promise<Object>} A Promise that resolves to an object with the minting result.
 * @property {boolean} success - Indicates if the minting was successful.
 * @property {string} link - The link to view the newly minted NFT.
 * @property {string} address - The address of the new NFT.
 * @property {string | null | undefined} error - An optional error message if the minting failed.
 */
    async mintNFT({
        collectionAddress,
        adminPublicKey,
        name,
        symbol,
        uri,
        fee,
    }: {
        collectionAddress: string;
        adminPublicKey: string;
        name: string;
        symbol: string;
        uri: string;
        fee: number;
    }): Promise<{
        success: boolean;
        link: string;
        address: string;
        error?: string | null;
    }> {
        try {
            const umi = this.umi;
            const mint = generateSigner(umi);

            let transaction = new TransactionBuilder();
            elizaLogger.log("collection address", collectionAddress);
            const collectionAddressKey = publicKey(collectionAddress);

            const info = {
                name,
                uri,
                symbol,
            };
            transaction = transaction.add(
                createNft(umi, {
                    mint,
                    ...info,
                    sellerFeeBasisPoints: percentAmount(fee),
                    collection: {
                        key: collectionAddressKey,
                        verified: false,
                    },
                })
            );

            transaction = transaction.add(
                updateV1(umi, {
                    mint: mint.publicKey,
                    newUpdateAuthority: publicKey(adminPublicKey), // updateAuthority's public key
                })
            );

            await transaction.sendAndConfirm(umi);

            const address = mint.publicKey;
            return {
                success: true,
                link: getExplorerLink("address", address, this.cluster),
                address,
                error: null,
            };
        } catch (e) {
            return {
                success: false,
                link: "",
                address: "",
                error: e.message,
            };
        }
    }

/**
 * Asynchronously verifies if an NFT belongs to a specific collection
 * @param {string} collectionAddress - The address of the collection
 * @param {string} nftAddress - The address of the NFT
 * @returns {Promise<{isVerified: boolean, error: string | null}>} An object containing the verification result and error message if applicable
 */
    async verifyNft({
        collectionAddress,
        nftAddress,
    }: {
        collectionAddress: string;
        nftAddress: string;
    }): Promise<{
        isVerified: boolean;
        error: string | null;
    }> {
        try {
            const umi = this.umi;
            const collectionAddressKey = publicKey(collectionAddress);
            const nftAddressKey = publicKey(nftAddress);

            let transaction = new TransactionBuilder();
            transaction = transaction.add(
                verifyCollectionV1(umi, {
                    metadata: findMetadataPda(umi, { mint: nftAddressKey }),
                    collectionMint: collectionAddressKey,
                    authority: umi.identity,
                })
            );

            await transaction.sendAndConfirm(umi);

            elizaLogger.log(
                `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
                    "address",
                    nftAddress,
                    this.cluster
                )}`
            );
            return {
                isVerified: true,
                error: null,
            };
        } catch (e) {
            return {
                isVerified: false,
                error: e.message,
            };
        }
    }
}

export default WalletSolana;
