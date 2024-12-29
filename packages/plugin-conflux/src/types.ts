import { z } from "zod";
import { Content } from "@elizaos/core";

export const TransferSchema = z.object({
    to: z.string(),
    amount: z.number(), // use number ignoring decimals issue
});

/**
 * Interface representing the content of a transfer.
 * @typedef {object} TransferContent
 * @property {string} to - The recipient of the transfer.
 * @property {number} amount - The amount to transfer.
 */
export interface TransferContent {
    to: string;
    amount: number;
}

export const isTransferContent = (object: any): object is TransferContent => {
    if (TransferSchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
};

export const PumpCreateSchema = z.object({
    action: z.literal("CREATE_TOKEN"),
    params: z.object({
        symbol: z.string(),
        name: z.string(),
        description: z.string(),
    }),
});

export const PumpBuySchema = z.object({
    action: z.literal("BUY_TOKEN"),
    params: z.object({
        tokenAddress: z.string(),
        value: z.number(),
    }),
});

export const PumpSellSchema = z.object({
    action: z.literal("SELL_TOKEN"),
    params: z.object({
        tokenAddress: z.string(),
        value: z.number(),
    }),
});

export const PumpSchema = z.union([
    PumpCreateSchema,
    PumpBuySchema,
    PumpSellSchema,
]);

/**
 * Represents the inferred type of the PumpSchema.
 */
export type PumpContent = z.infer<typeof PumpSchema>;
/**
 * Type definition for creating a Pump object based on PumpCreateSchema
 */
export type PumpCreateContent = z.infer<typeof PumpCreateSchema>;
/**
 * Type definition representing the inferred type of PumpBuySchema
 */
export type PumpBuyContent = z.infer<typeof PumpBuySchema>;
/**
 * Type definition for PumpSellContent, inferred from PumpSellSchema.
 */
export type PumpSellContent = z.infer<typeof PumpSellSchema>;

/**
 * Check if the given object is of type PumpContent.
 * @param {any} object - The object to check.
 * @returns {boolean} Returns true if the object is of type PumpContent, otherwise false.
 */
export function isPumpContent(object: any): object is PumpContent {
    if (PumpSchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
}

/**
 * Check if the input object is a valid instance of PumpCreateContent.
 * @param {any} object - The object to be checked.
 * @returns {boolean} - True if the input object is a valid instance of PumpCreateContent, false otherwise.
 */
export function isPumpCreateContent(object: any): object is PumpCreateContent {
    if (PumpCreateSchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
}

/**
 * Check if the provided object is a valid PumpBuyContent.
 *
 * @param {any} object The object to be validated.
 * @returns {boolean} Returns true if the object is a valid PumpBuyContent, otherwise false.
 */
export function isPumpBuyContent(object: any): object is PumpBuyContent {
    if (PumpBuySchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
}

/**
 * Checks if the provided object is of type PumpSellContent.
 * @param {any} object - The object to check.
 * @returns {boolean} Returns true if the object is of type PumpSellContent, false otherwise.
 */
export function isPumpSellContent(object: any): object is PumpSellContent {
    if (PumpSellSchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
}
