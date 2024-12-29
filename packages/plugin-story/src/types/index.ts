import type { Token } from "@lifi/types";
import type {
    Account,
    Address,
    Chain,
    Hash,
    HttpTransport,
    PublicClient,
    WalletClient,
} from "viem";

/**
 * Type indicating the supported blockchain chain, currently only supporting "odyssey".
 */
export type SupportedChain = "odyssey";

// Transaction types
/**
 * Interface representing a transaction object.
 * @typedef {object} Transaction
 * @property {Hash} hash - The hash of the transaction.
 * @property {Address} from - The address initiating the transaction.
 * @property {Address} to - The address receiving the transaction.
 * @property {bigint} value - The value of the transaction.
 * @property {`0x${string}`} [data] - Optional data for the transaction.
 * @property {number} [chainId] - The chain ID for the transaction.
 */
export interface Transaction {
    hash: Hash;
    from: Address;
    to: Address;
    value: bigint;
    data?: `0x${string}`;
    chainId?: number;
}

// Token types
/**
 * Interface representing a TokenWithBalance object.
 * 
 * @typedef {Object} TokenWithBalance
 * @property {Token} token - The token object.
 * @property {bigint} balance - The balance of the token.
 * @property {string} formattedBalance - The balance of the token formatted as a string.
 * @property {string} priceUSD - The price of the token in USD.
 * @property {string} valueUSD - The value of the token in USD.
 */
export interface TokenWithBalance {
    token: Token;
    balance: bigint;
    formattedBalance: string;
    priceUSD: string;
    valueUSD: string;
}

/**
 * Represents the balance information of a wallet.
 * @typedef {Object} WalletBalance
 * @property {SupportedChain} chain - The supported blockchain chain.
 * @property {Address} address - The wallet address.
 * @property {string} totalValueUSD - The total value in USD.
 * @property {TokenWithBalance[]} tokens - An array of tokens with their respective balances.
 */
export interface WalletBalance {
    chain: SupportedChain;
    address: Address;
    totalValueUSD: string;
    tokens: TokenWithBalance[];
}

// Chain configuration
/**
 * Interface representing metadata for a blockchain chain.
 * @typedef {object} ChainMetadata
 * @property {number} chainId - The unique identifier for the blockchain chain.
 * @property {string} name - The name of the blockchain chain.
 * @property {Chain} chain - The type of blockchain chain.
 * @property {string} rpcUrl - The URL for the Remote Procedure Call (RPC) endpoint of the chain.
 * @property {object} nativeCurrency - Object representing the native currency of the chain.
 * @property {string} nativeCurrency.name - The name of the native currency.
 * @property {string} nativeCurrency.symbol - The symbol of the native currency.
 * @property {number} nativeCurrency.decimals - The number of decimal places used for the native currency.
 * @property {string} blockExplorerUrl - The URL for the block explorer of the chain.
 */
export interface ChainMetadata {
    chainId: number;
    name: string;
    chain: Chain;
    rpcUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    blockExplorerUrl: string;
}

/**
 * Represents the configuration settings for a blockchain chain.
 *
 * @property {Chain} chain - The blockchain chain configuration.
 * @property {PublicClient<HttpTransport, Chain, Account | undefined>} publicClient - The public client used for interacting with the blockchain chain.
 * @property {WalletClient} [walletClient] - Optional wallet client for managing wallets on the blockchain chain.
 */
export interface ChainConfig {
    chain: Chain;
    publicClient: PublicClient<HttpTransport, Chain, Account | undefined>;
    walletClient?: WalletClient;
}

// Action parameters
/**
 * Interface for the parameters needed to register an IP.
 * @typedef {object} RegisterIPParams
 * @property {string} title - The title of the IP.
 * @property {string} description - The description of the IP.
 * @property {string} ipType - The type of the IP.
 */
export interface RegisterIPParams {
    title: string;
    description: string;
    ipType: string;
}

/**
 * Interface for specifying parameters for licensing IP.
 * @property {Address} licensorIpId - The ID of the licensor's IP.
 * @property {string} licenseTermsId - The ID of the license terms.
 * @property {number} amount - The amount to be licensed.
 */
export interface LicenseIPParams {
    licensorIpId: Address;
    licenseTermsId: string;
    amount: number;
}

/**
 * Interface for parameters needed to attach terms to an IP.
 * @property {Address} ipId - The ID of the IP address.
 * @property {number} mintingFee - The minting fee for the IP.
 * @property {boolean} commercialUse - Indicates if commercial use is allowed.
 * @property {number} commercialRevShare - The percentage of commercial revenue share.
 */
export interface AttachTermsParams {
    ipId: Address;
    mintingFee: number;
    commercialUse: boolean;
    commercialRevShare: number;
}

// Plugin configuration
/**
 * Interface for the configuration of an EVM plugin.
 * @typedef {Object} EvmPluginConfig
 * @property {Object} rpcUrl - Configuration for RPC URLs.
 * @property {string} rpcUrl.ethereum - Ethereum RPC URL.
 * @property {string} rpcUrl.base - Base RPC URL.
 * @property {Object} secrets - Secrets configuration.
 * @property {string} secrets.EVM_PRIVATE_KEY - Private key for EVM.
 * @property {boolean} testMode - Flag for test mode.
 * @property {Object} multicall - Configuration for multicall.
 * @property {number} multicall.batchSize - Batch size for multicall.
 * @property {number} multicall.wait - Wait time for multicall.
 */
export interface EvmPluginConfig {
    rpcUrl?: {
        ethereum?: string;
        base?: string;
    };
    secrets?: {
        EVM_PRIVATE_KEY: string;
    };
    testMode?: boolean;
    multicall?: {
        batchSize?: number;
        wait?: number;
    };
}

// Provider types
/**
 * Interface representing token data including symbol, decimals, address, name, logo URI, and chain ID.
 * @interface
 * @extends Token
 * @property {string} symbol - The token symbol.
 * @property {number} decimals - The number of decimal places for the token.
 * @property {Address} address - The address of the token.
 * @property {string} name - The token name.
 * @property {string} [logoURI] - The URL to the token's logo image. Optional.
 * @property {number} chainId - The chain ID that the token belongs to.
 */
export interface TokenData extends Token {
    symbol: string;
    decimals: number;
    address: Address;
    name: string;
    logoURI?: string;
    chainId: number;
}

/**
 * An interface representing the response object for retrieving token price information.
 * @property {string} priceUSD - The price of the token in USD.
 * @property {TokenData} token - The data object containing information about the token.
 */
export interface TokenPriceResponse {
    priceUSD: string;
    token: TokenData;
}

/**
 * Interface representing a response that contains a list of tokens.
 * @property {TokenData[]} tokens - An array of TokenData objects.
 */
export interface TokenListResponse {
    tokens: TokenData[];
}

/**
 * Interface for custom error object used by the provider.
 * @interface ProviderError
 * @extends {Error}
 * @property {number} [code] - Optional error code.
 * @property {unknown} [data] - Optional additional data related to the error.
 */
export interface ProviderError extends Error {
    code?: number;
    data?: unknown;
}
