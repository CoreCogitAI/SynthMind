import type { Principal } from "@dfinity/principal";
import type { ActorSubclass } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
/**
 * Interface for representing a CP config object.
 * @typedef {Object} ICPConfig
 * @property {string} privateKey - The private key for the CP configuration.
 * @property {("mainnet"|"testnet")} [network="mainnet"] - Optional network type for the CP configuration, defaults to "mainnet".
 */
export interface ICPConfig {
    privateKey: string;
    network?: "mainnet" | "testnet";
}

/**
 * Interface representing parameters for a transfer operation.
 * @param {Principal | string} to - The recipient of the transfer.
 * @param {bigint} amount - The amount to transfer.
 * @param {bigint} [memo] - Optional memo for the transfer.
 */
export interface TransferParams {
    to: Principal | string;
    amount: bigint;
    memo?: bigint;
}

/**
 * Interface representing the Balance of a Canister Process (CP).
 * @property {bigint} e8s - The balance in e8s.
 */
export interface ICPBalance {
    e8s: bigint;
}

/**
 * Interface representing the result of a transfer operation.
 *
 * @typedef {Object} TransferResult
 * @property {bigint} [Ok] - The value if the transfer was successful.
 * @property {string} [Err] - The error message if the transfer failed.
 */
export interface TransferResult {
    Ok?: bigint;
    Err?: string;
}

/**
 * Interface representing a CP Provider.
 */
 
/**
 * Get the balance for a given principal.
 * @param {string} principal - The principal to get the balance for.
 * @returns {Promise<ICPBalance>} - A promise that resolves to the balance of the principal.
 */

/**
 * Transfer funds to a recipient.
 * @param {TransferParams} params - The transfer parameters.
 * @returns {Promise<TransferResult>} - A promise that resolves to the result of the transfer.
 */
 */
export interface ICPProvider {
    getBalance(principal: string): Promise<ICPBalance>;
    transfer(params: TransferParams): Promise<TransferResult>;
}

// Credentials obtained after login, used to create an actor with the logged-in identity. The actor can call canister methods
/**
 * Type definition for creating an actor instance.
 * @template T - The type of the actor subclass
 * @param {IDL.InterfaceFactory} idlFactory - The Candid interface factory
 * @param {string} canister_id - The target canister ID
 * @returns {Promise<ActorSubclass<T>>} - A promise that resolves to an instance of the actor subclass
 */
export type ActorCreator = <T>(
    idlFactory: IDL.InterfaceFactory, // Candid interface
    canister_id: string // Target canister
) => Promise<ActorSubclass<T>>;

/**
 * Type representing the arguments required to create a meme token.
 * @typedef {Object} CreateMemeTokenArg
 * @property {string} name - The name of the meme token.
 * @property {string} symbol - The symbol of the meme token.
 * @property {string} description - The description of the meme token.
 * @property {string} logo - The logo image URL of the meme token.
 * @property {string} [twitter] - Optional Twitter handle associated with the meme token.
 * @property {string} [website] - Optional website URL associated with the meme token.
 * @property {string} [telegram] - Optional Telegram handle associated with the meme token.
 */

export type CreateMemeTokenArg = {
    name: string;
    symbol: string;
    description: string;
    logo: string;
    twitter?: string;
    website?: string;
    telegram?: string;
};
