import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { Keypair } from "@solana/web3.js";
import crypto from "crypto";
import { DeriveKeyResponse, TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { PrivateKeyAccount, keccak256 } from "viem";
import { RemoteAttestationProvider } from "./remoteAttestationProvider";
import { TEEMode, RemoteAttestationQuote } from "../types/tee";

/**
 * Interface for specifying the data required to derive key attestation.
 * @typedef {Object} DeriveKeyAttestationData
 * @property {string} agentId - The identifier of the agent.
 * @property {string} publicKey - The public key string.
 */
interface DeriveKeyAttestationData {
    agentId: string;
    publicKey: string;
}

/**
 * Class representing a DeriveKeyProvider used for key derivation with remote attestation.
 * @class
 */
 
class DeriveKeyProvider {
    private client: TappdClient;
    private raProvider: RemoteAttestationProvider;

/**
 * Constructor for the TEEManager class.
 * @param {string} teeMode - The mode in which to run the TEEManager. Can be LOCAL, DOCKER, or PRODUCTION.
 */
    constructor(teeMode?: string) {
        let endpoint: string | undefined;

        // Both LOCAL and DOCKER modes use the simulator, just with different endpoints
        switch (teeMode) {
            case TEEMode.LOCAL:
                endpoint = "http://localhost:8090";
                console.log(
                    "TEE: Connecting to local simulator at localhost:8090"
                );
                break;
            case TEEMode.DOCKER:
                endpoint = "http://host.docker.internal:8090";
                console.log(
                    "TEE: Connecting to simulator via Docker at host.docker.internal:8090"
                );
                break;
            case TEEMode.PRODUCTION:
                endpoint = undefined;
                console.log(
                    "TEE: Running in production mode without simulator"
                );
                break;
            default:
                throw new Error(
                    `Invalid TEE_MODE: ${teeMode}. Must be one of: LOCAL, DOCKER, PRODUCTION`
                );
        }

        this.client = endpoint ? new TappdClient(endpoint) : new TappdClient();
        this.raProvider = new RemoteAttestationProvider(teeMode);
    }

/**
 * Generates a Remote Attestation Quote for Derive Key with the specified agent ID and public key.
 * 
 * @param {string} agentId - The ID of the agent.
 * @param {string} publicKey - The public key used for the attestation.
 * @returns {Promise<RemoteAttestationQuote>} The generated Remote Attestation Quote for Derive Key.
 */
    private async generateDeriveKeyAttestation(
        agentId: string,
        publicKey: string
    ): Promise<RemoteAttestationQuote> {
        const deriveKeyData: DeriveKeyAttestationData = {
            agentId,
            publicKey,
        };
        const reportdata = JSON.stringify(deriveKeyData);
        console.log("Generating Remote Attestation Quote for Derive Key...");
        const quote = await this.raProvider.generateAttestation(reportdata);
        console.log("Remote Attestation Quote generated successfully!");
        return quote;
    }

/**
 * Asynchronously derives a key based on the given path and subject in a Trusted Execution Environment (TEE).
 * 
 * @param {string} path - The path used for key derivation.
 * @param {string} subject - The subject used for key derivation.
 * @returns {Promise<DeriveKeyResponse>} A promise that resolves with the derived key response.
 * @throws {Error} If there is an error during the key derivation process.
 */
    async rawDeriveKey(
        path: string,
        subject: string
    ): Promise<DeriveKeyResponse> {
        try {
            if (!path || !subject) {
                console.error(
                    "Path and Subject are required for key derivation"
                );
            }

            console.log("Deriving Raw Key in TEE...");
            const derivedKey = await this.client.deriveKey(path, subject);

            console.log("Raw Key Derived Successfully!");
            return derivedKey;
        } catch (error) {
            console.error("Error deriving raw key:", error);
            throw error;
        }
    }

/**
 * Derives an Ed25519 keypair using the provided path, subject, and agentId.
 * 
 * @param {string} path - The path for key derivation.
 * @param {string} subject - The subject for key derivation.
 * @param {string} agentId - The agentId for generating attestation.
 * @returns {Promise<{ keypair: Keypair; attestation: RemoteAttestationQuote }>} The derived keypair and attestation.
 */
    async deriveEd25519Keypair(
        path: string,
        subject: string,
        agentId: string
    ): Promise<{ keypair: Keypair; attestation: RemoteAttestationQuote }> {
        try {
            if (!path || !subject) {
                console.error(
                    "Path and Subject are required for key derivation"
                );
            }

            console.log("Deriving Key in TEE...");
            const derivedKey = await this.client.deriveKey(path, subject);
            const uint8ArrayDerivedKey = derivedKey.asUint8Array();

            const hash = crypto.createHash("sha256");
            hash.update(uint8ArrayDerivedKey);
            const seed = hash.digest();
            const seedArray = new Uint8Array(seed);
            const keypair = Keypair.fromSeed(seedArray.slice(0, 32));

            // Generate an attestation for the derived key data for public to verify
            const attestation = await this.generateDeriveKeyAttestation(
                agentId,
                keypair.publicKey.toBase58()
            );
            console.log("Key Derived Successfully!");

            return { keypair, attestation };
        } catch (error) {
            console.error("Error deriving key:", error);
            throw error;
        }
    }

/**
 * Asynchronously derives an ECDSA key pair using the provided path and subject. 
 * 
 * @param {string} path - The path to derive the key from.
 * @param {string} subject - The subject for the key derivation.
 * @param {string} agentId - The agent ID for generating the attestation.
 * @returns {Promise<{keypair: PrivateKeyAccount, attestation: RemoteAttestationQuote}>} - A promise that resolves to an object containing the derived key pair and attestation.
 * @throws {Error} If an error occurs during the key derivation process.
 */
    async deriveEcdsaKeypair(
        path: string,
        subject: string,
        agentId: string
    ): Promise<{
        keypair: PrivateKeyAccount;
        attestation: RemoteAttestationQuote;
    }> {
        try {
            if (!path || !subject) {
                console.error(
                    "Path and Subject are required for key derivation"
                );
            }

            console.log("Deriving ECDSA Key in TEE...");
            const deriveKeyResponse: DeriveKeyResponse =
                await this.client.deriveKey(path, subject);
            const hex = keccak256(deriveKeyResponse.asUint8Array());
            const keypair: PrivateKeyAccount = privateKeyToAccount(hex);

            // Generate an attestation for the derived key data for public to verify
            const attestation = await this.generateDeriveKeyAttestation(
                agentId,
                keypair.address
            );
            console.log("ECDSA Key Derived Successfully!");

            return { keypair, attestation };
        } catch (error) {
            console.error("Error deriving ecdsa key:", error);
            throw error;
        }
    }
}

const deriveKeyProvider: Provider = {
    get: async (runtime: IAgentRuntime, _message?: Memory, _state?: State) => {
        const teeMode = runtime.getSetting("TEE_MODE");
        const provider = new DeriveKeyProvider(teeMode);
        const agentId = runtime.agentId;
        try {
            // Validate wallet configuration
            if (!runtime.getSetting("WALLET_SECRET_SALT")) {
                console.error(
                    "Wallet secret salt is not configured in settings"
                );
                return "";
            }

            try {
                const secretSalt =
                    runtime.getSetting("WALLET_SECRET_SALT") || "secret_salt";
                const solanaKeypair = await provider.deriveEd25519Keypair(
                    "/",
                    secretSalt,
                    agentId
                );
                const evmKeypair = await provider.deriveEcdsaKeypair(
                    "/",
                    secretSalt,
                    agentId
                );
                return JSON.stringify({
                    solana: solanaKeypair.keypair.publicKey,
                    evm: evmKeypair.keypair.address,
                });
            } catch (error) {
                console.error("Error creating PublicKey:", error);
                return "";
            }
        } catch (error) {
            console.error("Error in derive key provider:", error.message);
            return `Failed to fetch derive key information: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
    },
};

export { deriveKeyProvider, DeriveKeyProvider };
