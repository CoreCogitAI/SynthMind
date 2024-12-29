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
import * as viemChains from "viem/chains";

const _SupportedChainList = Object.keys(viemChains) as Array<
    keyof typeof viemChains
>;
/**
 * Definition of the supported chain type.
 * @typedef {Object} SupportedChain
 * @type {Array} SupportedChainList
 * @property {Number} number - Index of the SupportedChainList array
 */
export type SupportedChain = (typeof _SupportedChainList)[number];

// Transaction types
/**
 * Represents a transaction.
 * @typedef {object} Transaction
 * @property {Hash} hash - The hash of the transaction.
 * @property {Address} from - The address sending the transaction.
 * @property {Address} to - The address receiving the transaction.
 * @property {bigint} value - The value of the transaction.
 * @property {string} [data] - Optional additional data for the transaction.
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
 * Represents a token with its balance and related details.
 * @typedef {Object} TokenWithBalance
 * @property {Token} token - The token object.
 * @property {bigint} balance - The balance of the token.
 * @property {string} formattedBalance - The formatted balance of the token.
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
 * Interface representing the balance of a wallet.
 * @interface WalletBalance
 * @property {SupportedChain} chain - The blockchain network the wallet belongs to.
 * @property {Address} address - The address of the wallet.
 * @property {string} totalValueUSD - The total value in USD of the wallet.
 * @property {TokenWithBalance[]} tokens - An array of tokens with their respective balance in the wallet.
 */
export interface WalletBalance {
    chain: SupportedChain;
    address: Address;
    totalValueUSD: string;
    tokens: TokenWithBalance[];
}

// Chain configuration
/**
 * Interface representing metadata for a blockchain network.
 * @property {number} chainId - The unique identifier for the blockchain network.
 * @property {string} name - The name of the blockchain network.
 * @property {Chain} chain - The type of blockchain network.
 * @property {string} rpcUrl - The URL for the RPC endpoint of the network.
 * @property {Object} nativeCurrency - Information about the native currency of the network.
 * @property {string} nativeCurrency.name - The name of the native currency.
 * @property {string} nativeCurrency.symbol - The symbol of the native currency.
 * @property {number} nativeCurrency.decimals - The number of decimal places for the native currency.
 * @property {string} blockExplorerUrl - The URL for the blockchain explorer of the network.
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
 * Interface representing the configuration for a blockchain network.
 * @property {Chain} chain - The blockchain network being configured.
 * @property {PublicClient<HttpTransport, Chain, Account | undefined>} publicClient - The public client used for interacting with the blockchain network.
 * @property {WalletClient | undefined} [walletClient] - Optional wallet client for interfacing with the blockchain network's wallet.
 */
export interface ChainConfig {
    chain: Chain;
    publicClient: PublicClient<HttpTransport, Chain, Account | undefined>;
    walletClient?: WalletClient;
}

// Action parameters
/**
 * Interface for defining transfer parameters.
 *
 * @property {SupportedChain} fromChain - The chain from which the transfer is being made.
 * @property {Address} toAddress - The address to which the transfer is being made.
 * @property {string} amount - The amount to transfer.
 * @property {string} [data] - Optional additional data for the transfer.
 */
```
export interface TransferParams {
    fromChain: SupportedChain;
    toAddress: Address;
    amount: string;
    data?: `0x${string}`;
}

/**
 * Interface representing parameters for a swap operation.
 * @typedef {Object} SwapParams
 * @property {SupportedChain} chain - The blockchain network on which the swap will be performed.
 * @property {Address} fromToken - The token to swap from.
 * @property {Address} toToken - The token to swap to.
 * @property {string} amount - The amount of tokens to swap.
 * @property {number} [slippage] - Optional parameter specifying the allowable slippage percentage.
 */
export interface SwapParams {
    chain: SupportedChain;
    fromToken: Address;
    toToken: Address;
    amount: string;
    slippage?: number;
}

/**
 * Interface for defining parameters needed to perform a cross-chain token transfer.
 * @typedef {Object} BridgeParams
 * @property {SupportedChain} fromChain - The chain where the transfer originates from.
 * @property {SupportedChain} toChain - The chain where the transfer will be sent to.
 * @property {Address} fromToken - The token address on the fromChain.
 * @property {Address} toToken - The token address on the toChain.
 * @property {string} amount - The amount of tokens to be transferred.
 * @property {Address} [toAddress] - The optional recipient address on the toChain.
 */
export interface BridgeParams {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    fromToken: Address;
    toToken: Address;
    amount: string;
    toAddress?: Address;
}

// Plugin configuration
/**
 * Interface for configuring EVM plugins.
 * @typedef {Object} EvmPluginConfig
 * @property {Object} rpcUrl - Object containing RPC URLs for different EVM networks.
 * @property {string} rpcUrl.ethereum - RPC URL for Ethereum network.
 * @property {string} rpcUrl.abstract - RPC URL for Abstract network.
 * @property {string} rpcUrl.base - RPC URL for Base network.
 * @property {string} rpcUrl.sepolia - RPC URL for Sepolia network.
 * @property {string} rpcUrl.bsc - RPC URL for Binance Smart Chain network.
 * @property {string} rpcUrl.arbitrum - RPC URL for Arbitrum network.
 * @property {string} rpcUrl.avalanche - RPC URL for Avalanche network.
 * @property {string} rpcUrl.polygon - RPC URL for Polygon network.
 * @property {string} rpcUrl.optimism - RPC URL for Optimism network.
 * @property {string} rpcUrl.cronos - RPC URL for Cronos network.
 * @property {string} rpcUrl.gnosis - RPC URL for Gnosis network.
 * @property {string} rpcUrl.fantom - RPC URL for Fantom network.
 * @property {string} rpcUrl.klaytn - RPC URL for Klaytn network.
 * @property {string} rpcUrl.celo - RPC URL for Celo network.
 * @property {string} rpcUrl.moonbeam - RPC URL for Moonbeam network.
 * @property {string} rpcUrl.aurora - RPC URL for Aurora network.
 * @property {string} rpcUrl.harmonyOne - RPC URL for Harmony One network.
 * @property {string} rpcUrl.moonriver - RPC URL for Moonriver network.
 * @property {string} rpcUrl.arbitrumNova - RPC URL for Arbitrum Nova network.
 * @property {string} rpcUrl.mantle - RPC URL for Mantle network.
 * @property {string} rpcUrl.linea - RPC URL for Linea network.
 * @property {string} rpcUrl.scroll - RPC URL for Scroll network.
 * @property {string} rpcUrl.filecoin - RPC URL for Filecoin network.
 * @property {string} rpcUrl.taiko - RPC URL for Taiko network.
 * @property {string} rpcUrl.zksync - RPC URL for ZKSync network.
 * @property {string} rpcUrl.canto - RPC URL for Canto network.
 * @property {string} rpcUrl.alienx - RPC URL for AlienX network.
 * @property {Object} secrets - Object containing secrets for EVM plugins.
 * @property {string} secrets.EVM_PRIVATE_KEY - Private key for EVM.
 * @property {boolean} testMode - Flag indicating test mode.
 * @property {Object} multicall - Object containing configuration for multicall feature.
 * @property {number} multicall.batchSize - Batch size for multicall requests.
 * @property {number} multicall.wait - Wait time for multicall requests.
 */
export interface EvmPluginConfig {
    rpcUrl?: {
        ethereum?: string;
        abstract?: string;
        base?: string;
        sepolia?: string;
        bsc?: string;
        arbitrum?: string;
        avalanche?: string;
        polygon?: string;
        optimism?: string;
        cronos?: string;
        gnosis?: string;
        fantom?: string;
        klaytn?: string;
        celo?: string;
        moonbeam?: string;
        aurora?: string;
        harmonyOne?: string;
        moonriver?: string;
        arbitrumNova?: string;
        mantle?: string;
        linea?: string;
        scroll?: string;
        filecoin?: string;
        taiko?: string;
        zksync?: string;
        canto?: string;
        alienx?: string;
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

// LiFi types
/**
 * Represents the status of a LiFi action.
 * @typedef {Object} LiFiStatus
 * @property {string} status - The status of the LiFi action. Can be "PENDING", "DONE", or "FAILED".
 * @property {string} [substatus] - Optional additional status information.
 * @property {Error} [error] - If the status is "FAILED", this property contains the associated error.
 */
export type LiFiStatus = {
    status: "PENDING" | "DONE" | "FAILED";
    substatus?: string;
    error?: Error;
};

/**
 * Data structure representing a LiFi route.
 * @typedef {Object} LiFiRoute
 * @property {Hash} transactionHash - The hash of the transaction associated with the route.
 * @property {`0x${string}`} transactionData - The transaction data in hexadecimal format.
 * @property {Address} toAddress - The target address of the route.
 * @property {LiFiStatus} status - The status of the LiFi route.
 */
export type LiFiRoute = {
    transactionHash: Hash;
    transactionData: `0x${string}`;
    toAddress: Address;
    status: LiFiStatus;
};

// Provider types
/**
 * Interface representing token data.
 * @interface TokenData
 * @extends Token
 * @property {string} symbol - The symbol of the token.
 * @property {number} decimals - The number of decimal places for the token.
 * @property {Address} address - The address of the token.
 * @property {string} name - The name of the token.
 * @property {string} [logoURI] - The URI for the token's logo. Optional.
 * @property {number} chainId - The chain ID for the token.
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
 * Interface representing a response object for token price information.
 * @typedef {object} TokenPriceResponse
 * @property {string} priceUSD - The price of the token in USD.
 * @property {TokenData} token - The data for the token.
 */
export interface TokenPriceResponse {
    priceUSD: string;
    token: TokenData;
}

/**
 * Interface for the response containing a list of tokens.
 * @typedef {Object} TokenListResponse
 * @property {TokenData[]} tokens - Array of TokenData objects
 */
export interface TokenListResponse {
    tokens: TokenData[];
}

/**
 * Interface representing an error object with optional code and data properties.
 * @interface
 * @extends Error
 * @property {number | undefined} code - The error code.
 * @property {unknown | undefined} data - Additional error data.
 */
export interface ProviderError extends Error {
    code?: number;
    data?: unknown;
}
