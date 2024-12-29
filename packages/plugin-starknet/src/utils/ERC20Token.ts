import {
    AccountInterface,
    cairo,
    CallData,
    Calldata,
    Contract,
    ProviderInterface,
} from "starknet";
import erc20Abi from "./erc20.json";

/**
 * Represents a request to approve a contract call.
 *
 * @typedef ApproveCall
 * @type {Object}
 * @property {string} contractAddress - The address of the contract.
 * @property {"approve"} entrypoint - The entrypoint for the call.
 * @property {Calldata} calldata - The data for the call.
 */
export type ApproveCall = {
    contractAddress: string;
    entrypoint: "approve";
    calldata: Calldata;
};

/**
 * Represents a transfer call which includes contract address, entrypoint, and calldata.
 * @typedef {object} TransferCall
 * @property {string} contractAddress - The address of the contract
 * @property {string} entrypoint - The entry point of the call (always "transfer")
 * @property {Calldata} calldata - The data to be passed to the contract
 */
export type TransferCall = {
    contractAddress: string;
    entrypoint: "transfer";
    calldata: Calldata;
};

/**
 * ERC20Token class representing an ERC20 token contract.
export class ERC20Token {
    abi: any;
    contract: Contract;
    calldata: CallData;
/**
 * Constructor for creating a new instance of the class.
 * @param {string} token - The token to be passed.
 * @param {ProviderInterface | AccountInterface} [providerOrAccount] - Optional parameter representing the provider or account.
 */
    constructor(
        token: string,
        providerOrAccount?: ProviderInterface | AccountInterface
    ) {
        this.contract = new Contract(erc20Abi, token, providerOrAccount);
        this.calldata = new CallData(this.contract.abi);
    }

/**
 * Retrieve the address of the contract.
 * @returns {string} The address of the contract.
 */
    public address() {
        return this.contract.address;
    }

/**
 * Returns the balance of the specified account.
 * @param {string} account - The account for which to retrieve the balance.
 * @return {Promise<bigint>} The balance of the specified account as a bigint.
 */
    public async balanceOf(account: string): Promise<bigint> {
        const result = await this.contract.call("balance_of", [account]);
        return result as bigint;
    }

/**
 * Retrieves the number of decimal places for the token.
 * 
 * @returns {Promise<bigint>} The number of decimal places as a BigInt.
 */
    public async decimals() {
        const result = await this.contract.call("decimals");
        return result as bigint;
    }

/**
 * Generates an ApproveCall object with the specified spender and amount.
 * 
 * @param {string} spender The address of the spender
 * @param {bigint} amount The amount to approve
 * @returns {ApproveCall} An object containing contract address, entrypoint, and calldata for the approval
 */
    public approveCall(spender: string, amount: bigint): ApproveCall {
        return {
            contractAddress: this.contract.address,
            entrypoint: "approve",
            calldata: this.calldata.compile("approve", {
                spender: spender,
                amount: cairo.uint256(amount),
            }),
        };
    }

/**
 * Transfers a specified amount from the contract address to a recipient.
 * @param {string} recipient - The recipient address to transfer the amount to.
 * @param {bigint} amount - The amount to transfer.
 * @returns {TransferCall} Returns the transfer call object with contract address, entrypoint, and calldata.
 */
    public transferCall(recipient: string, amount: bigint): TransferCall {
        return {
            contractAddress: this.contract.address,
            entrypoint: "transfer",
            calldata: this.calldata.compile("transfer", {
                recipient: recipient,
                amount: cairo.uint256(amount),
            }),
        };
    }
}
