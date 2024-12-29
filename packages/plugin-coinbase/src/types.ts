import { Coinbase } from "@coinbase/coinbase-sdk";
import { z } from "zod";
import { WebhookEventType, WebhookEventFilter, WebhookEventTypeFilter } from "@coinbase/coinbase-sdk/dist/client";

export const ChargeSchema = z.object({
    id: z.string().nullable(),
    price: z.number(),
    type: z.string(),
    currency: z.string().min(3).max(3),
    name: z.string().min(1),
    description: z.string().min(1),
});

/**
 * Interface representing the content of a charge.
 * @property {string | null} id - The ID of the charge.
 * @property {number} price - The price of the charge.
 * @property {string} type - The type of charge.
 * @property {string} currency - The currency code of the charge (e.g., USD).
 * @property {string} name - The name of the charge.
 * @property {string} description - The description of the charge.
 */
export interface ChargeContent {
    id: string | null;
    price: number;
    type: string;
    currency: string; // Currency code (e.g., USD)
    name: string; // Name of the charge
    description: string; // Description of the charge
}

export const isChargeContent = (object: any): object is ChargeContent => {
    if (ChargeSchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
};

export const TransferSchema = z.object({
    network: z.string().toLowerCase(),
    receivingAddresses: z.array(z.string()),
    transferAmount: z.number(),
    assetId: z.string().toLowerCase(),
});

/**
 * Interface representing content related to a transfer.
 * @typedef {Object} TransferContent
 * @property {string} network - The network on which the transfer is to be made.
 * @property {string[]} receivingAddresses - An array of receiving addresses for the transfer.
 * @property {number} transferAmount - The amount to be transferred.
 * @property {string} assetId - The ID of the asset to be transferred.
 */
export interface TransferContent {
    network: string;
    receivingAddresses: string[];
    transferAmount: number;
    assetId: string;
}

export const isTransferContent = (object: any): object is TransferContent => {
    return TransferSchema.safeParse(object).success;
};

/**
 * Represents a transaction including address, amount, status, error code, and transaction URL.
 * @typedef {Object} Transaction
 * @property {string} address - The address of the transaction.
 * @property {number} amount - The amount of the transaction.
 * @property {string} status - The status of the transaction.
 * @property {string | null} errorCode - The error code of the transaction, can be null if no error.
 * @property {string | null} transactionUrl - The URL of the transaction, can be null if not available.
 */
export type Transaction = {
    address: string;
    amount: number;
    status: string;
    errorCode: string | null;
    transactionUrl: string | null;
};
const assetValues = Object.values(Coinbase.assets) as [string, ...string[]];
export const TradeSchema = z.object({
    network: z.string().toLowerCase(),
    amount: z.number(),
    sourceAsset: z.enum(assetValues),
    targetAsset: z.enum(assetValues),
    side: z.enum(["BUY", "SELL"]),
});

/**
 * Interface representing trade content details.
 * @typedef {Object} TradeContent
 * @property {string} network - The network for the trade.
 * @property {number} amount - The amount of the trade.
 * @property {string} sourceAsset - The asset being traded.
 * @property {string} targetAsset - The asset to be received in the trade.
 * @property {"BUY" | "SELL"} side - The side of the trade, either "BUY" or "SELL".
 */
export interface TradeContent {
    network: string;
    amount: number;
    sourceAsset: string;
    targetAsset: string;
    side: "BUY" | "SELL";

}

export const isTradeContent = (object: any): object is TradeContent => {
    return TradeSchema.safeParse(object).success;
};

/**
 * Defines the structure of a trade transaction object.
 * @typedef {Object} TradeTransaction
 * @property {string} network - The network on which the trade transaction occurred.
 * @property {number} amount - The amount involved in the trade transaction.
 * @property {string} sourceAsset - The asset used as the source in the trade transaction.
 * @property {string} targetAsset - The asset targeted in the trade transaction.
 * @property {string} status - The current status of the trade transaction.
 * @property {string | null} errorCode - The error code associated with the trade transaction, if any.
 * @property {string | null} transactionUrl - The URL to view more details about the trade transaction, if available.
 */
export type TradeTransaction = {
    network: string;
    amount: number;
    sourceAsset: string;
    targetAsset: string;
    status: string;
    errorCode: string | null;
    transactionUrl: string | null;
};

/**
 * Interface representing the content of a Token Contract.
 * @typedef {Object} TokenContractContent
 * @property {"ERC20" | "ERC721" | "ERC1155"} contractType - The type of the contract (ERC20, ERC721, ERC1155).
 * @property {string} name - The name of the token.
 * @property {string} symbol - The symbol of the token.
 * @property {string} network - The network the token belongs to.
 * @property {string} [baseURI] - The base URI for token metadata.
 * @property {number} [totalSupply] - The total supply of tokens in the contract.
 */
export interface TokenContractContent {
    contractType: "ERC20" | "ERC721" | "ERC1155";
    name: string;
    symbol: string;
    network: string;
    baseURI?: string;
    totalSupply?: number;
}

export const TokenContractSchema = z.object({
    contractType: z.enum(["ERC20", "ERC721", "ERC1155"]).describe("The type of token contract to deploy"),
    name: z.string().describe("The name of the token"),
    symbol: z.string().describe("The symbol of the token"),
    network: z.string().describe("The blockchain network to deploy on"),
    baseURI: z.string().optional().describe("The base URI for token metadata (required for ERC721 and ERC1155)"),
    totalSupply: z.number().optional().describe("The total supply of tokens (only for ERC20)"),
}).refine(data => {
    if (data.contractType === "ERC20") {
        return typeof data.totalSupply === "number" || data.totalSupply === undefined;
    }
    if (["ERC721", "ERC1155"].includes(data.contractType)) {
        return typeof data.baseURI === "string" || data.baseURI === undefined;
    }
    return true;
}, {
    message: "Invalid token contract content",
    path: ["contractType"],
});

export const isTokenContractContent = (obj: any): obj is TokenContractContent => {
    return TokenContractSchema.safeParse(obj).success;
};

// Add to types.ts
/**
 * Interface representing the content of a contract invocation.
 *
 * @typedef {Object} ContractInvocationContent
 * @property {string} contractAddress - The address of the contract to invoke.
 * @property {string} method - The method to call on the contract.
 * @property {any[]} abi - The ABI (Application Binary Interface) of the contract.
 * @property {Record<string, any>} [args] - Optional arguments to pass to the contract method.
 * @property {string} [amount] - The amount of assets to send with the function call.
 * @property {string} assetId - The ID of the asset being used.
 * @property {string} networkId - The ID of the network on which the contract resides.
 */
export interface ContractInvocationContent {
    contractAddress: string;
    method: string;
    abi: any[];
    args?: Record<string, any>;
    amount?: string;
    assetId: string;
    networkId: string;
}

export const ContractInvocationSchema = z.object({
    contractAddress: z.string().describe("The address of the contract to invoke"),
    method: z.string().describe("The method to invoke on the contract"),
    abi: z.array(z.any()).describe("The ABI of the contract"),
    args: z.record(z.string(), z.any()).optional().describe("The arguments to pass to the contract method"),
    amount: z.string().optional().describe("The amount of the asset to send (as string to handle large numbers)"),
    assetId: z.string().describe("The ID of the asset to send (e.g., 'USDC')"),
    networkId: z.string().describe("The network ID to use (e.g., 'ethereum-mainnet')")
});

export const isContractInvocationContent = (obj: any): obj is ContractInvocationContent => {
    return ContractInvocationSchema.safeParse(obj).success;
};


export const WebhookSchema = z.object({
    networkId: z.string(),
    eventType: z.nativeEnum(WebhookEventType),
    eventTypeFilter:z.custom<WebhookEventTypeFilter>().optional(),
    eventFilters: z.array(z.custom<WebhookEventFilter>()).optional()
});

/**
 * Type definition for the content of a webhook, inferred from the WebhookSchema.
 */
export type WebhookContent = z.infer<typeof WebhookSchema>;

export const isWebhookContent = (object: any): object is WebhookContent => {
    return WebhookSchema.safeParse(object).success;
};

export const AdvancedTradeSchema = z.object({
    productId: z.string(),
    side: z.enum(["BUY", "SELL"]),
    amount: z.number(),
    orderType: z.enum(["MARKET", "LIMIT"]),
    limitPrice: z.number().optional(),
});

/**
 * Interface representing advanced trade content.
 *
 * @typedef {object} AdvancedTradeContent
 * @property {string} productId - The ID of the product.
 * @property {"BUY" | "SELL"} side - The side of the trade (BUY or SELL).
 * @property {number} amount - The amount of the trade.
 * @property {"MARKET" | "LIMIT"} orderType - The type of order (MARKET or LIMIT).
 * @property {number} [limitPrice] - The optional limit price for the trade.
 */
export interface AdvancedTradeContent {
    productId: string;
    side: "BUY" | "SELL";
    amount: number;
    orderType: "MARKET" | "LIMIT";
    limitPrice?: number;
}

export const isAdvancedTradeContent = (object: any): object is AdvancedTradeContent => {
    return AdvancedTradeSchema.safeParse(object).success;
};

/**
 * Represents the content needed to read data from a smart contract.
 * @interface
 * @property {string} contractAddress - The address of the smart contract to read from.
 * @property {string} method - The method to call on the smart contract.
 * @property {string} networkId - The network ID on which the smart contract is deployed.
 * @property {Record<string, any>} args - The arguments to pass to the method.
 * @property {any[]} abi - The optional ABI (Application Binary Interface) of the smart contract.
 */
export interface ReadContractContent {
    contractAddress: `0x${string}`;
    method: string;
    networkId: string;
    args: Record<string, any>;
    abi?: any[];
}

export const ReadContractSchema = z.object({
    contractAddress: z.string().describe("The address of the contract to read from"),
    method: z.string().describe("The view/pure method to call on the contract"),
    networkId: z.string().describe("The network ID to use"),
    args: z.record(z.string(), z.any()).describe("The arguments to pass to the contract method"),
    abi: z.array(z.any()).optional().describe("The contract ABI (optional)")
});

export const isReadContractContent = (obj: any): obj is ReadContractContent => {
    return ReadContractSchema.safeParse(obj).success;
};