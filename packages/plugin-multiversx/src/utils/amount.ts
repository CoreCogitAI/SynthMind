import BigNumber from "bignumber.js";

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

/**
 * Defines the PayloadType object with the following properties:
 * - amount: a string representing the amount
 * - decimals: a number representing the number of decimals
 */
type PayloadType = {
    amount: string;
    decimals: number;
};

export const denominateAmount = ({ amount, decimals }: PayloadType) => {
    return new BigNumber(amount)
        .shiftedBy(decimals)
        .decimalPlaces(0)
        .toFixed(0);
};
