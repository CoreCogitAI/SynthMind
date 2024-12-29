import BigNumber from "bignumber.js";

// Re-export BigNumber constructor
export const BN = BigNumber;

// Helper function to create new BigNumber instances
/**
 * Converts a string, number, or BigNumber to a BigNumber.
 * @param {string | number | BigNumber} value - The value to convert to a BigNumber.
 * @returns {BigNumber} The converted BigNumber.
 */
export function toBN(value: string | number | BigNumber): BigNumber {
    return new BigNumber(value);
}
