import type { ActorMethod } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import type { Principal } from "@dfinity/principal";

/**
 * Interface representing an account.
 * @property {Principal} owner - The owner of the account.
 * @property {Array<Uint8Array | number[]>} subaccount - The subaccount associated with the account.
 */
export interface Account {
    owner: Principal;
    subaccount: [] | [Uint8Array | number[]];
}
/**
 * Interface representing the arguments required to retrieve the balance of an account.
 * @typedef {object} AccountBalanceArgs
 * @property {string} account - The account for which the balance should be retrieved.
 */
export interface AccountBalanceArgs {
    account: string;
}
/**
 * Interface representing an allowance with specified amount and expiry date.
 * @typedef {Object} Allowance
 * @property {bigint} allowance - The amount of allowance.
 * @property {Array<bigint>} expires_at - The expiry date, represented as an array with either 0 or 1 element(s) of type `bigint`.
 */
export interface Allowance {
    allowance: bigint;
    expires_at: [] | [bigint];
}
/**
 * Interface for specifying arguments for an allowance.
 *
 * @param {Account} account - The account to check allowance for.
 * @param {Account} spender - The account allowed to spend on behalf of the main account.
 */
export interface AllowanceArgs {
    account: Account;
    spender: Account;
}
/**
 * Interface for the arguments required to approve a certain amount of tokens for a spender.
 * @typedef {Object} ApproveArgs
 * @property {Array} fee - Fee for the transaction.
 * @property {Array} memo - Memo for the transaction.
 * @property {Array} from_subaccount - Subaccount to transfer from.
 * @property {Array} created_at_time - Time when the transaction was created.
 * @property {bigint} amount - Amount of tokens to approve.
 * @property {Array} expected_allowance - Expected allowance for the spender.
 * @property {Array} expires_at - Expiration time for the approval.
 * @property {Account} spender - Account receiving the approval.
 */
export interface ApproveArgs {
    fee: [] | [bigint];
    memo: [] | [Uint8Array | number[]];
    from_subaccount: [] | [Uint8Array | number[]];
    created_at_time: [] | [bigint];
    amount: bigint;
    expected_allowance: [] | [bigint];
    expires_at: [] | [bigint];
    spender: Account;
}
/**
 * Represents the different types of errors that can occur during an approval operation.
 * This type includes the following possible error cases:
 * - GenericError: an error with a message and error code
 * - TemporarilyUnavailable: indication that the operation is temporarily unavailable
 * - Duplicate: indication that the approval operation is a duplicate of another
 * - BadFee: indication that the expected fee for the operation is not valid
 * - AllowanceChanged: indication that the allowance has been changed
 * - CreatedInFuture: indication that the operation is scheduled for a future time
 * - TooOld: indication that the operation is too old
 * - Expired: indication that the approval has expired based on a ledger time
 * - InsufficientFunds: indication that there are insufficient funds for the operation
 */
export type ApproveError =
    | {
          GenericError: { message: string; error_code: bigint };
      }
    | { TemporarilyUnavailable: null }
    | { Duplicate: { duplicate_of: bigint } }
    | { BadFee: { expected_fee: bigint } }
    | { AllowanceChanged: { current_allowance: bigint } }
    | { CreatedInFuture: { ledger_time: bigint } }
    | { TooOld: null }
    | { Expired: { ledger_time: bigint } }
    | { InsufficientFunds: { balance: bigint } };
/**
 * Interface representing information about an archive.
 * @typedef {Object} ArchiveInfo
 * @property {Principal} canister_id - The unique id representing the canister where the archive is stored.
 */
export interface ArchiveInfo {
    canister_id: Principal;
}
/**
 * Interface for defining archive options.
 * 
 * @interface ArchiveOptions
 * @property {bigint} num_blocks_to_archive - The number of blocks to archive.
 * @property {[] | [bigint]} max_transactions_per_response - The maximum number of transactions to include in a response.
 * @property {bigint} trigger_threshold - The threshold for triggering an archive.
 * @property {[] | [Array<Principal>]} more_controller_ids - Additional controller identifiers.
 * @property {[] | [bigint]} max_message_size_bytes - The maximum size in bytes for a message.
 * @property {[] | [bigint]} cycles_for_archive_creation - The number of cycles for creating an archive.
 * @property {[] | [bigint]} node_max_memory_size_bytes - The maximum memory size in bytes for a node.
 * @property {Principal} controller_id - The controller identifier for the archive.
 */
          
export interface ArchiveOptions {
    num_blocks_to_archive: bigint;
    max_transactions_per_response: [] | [bigint];
    trigger_threshold: bigint;
    more_controller_ids: [] | [Array<Principal>];
    max_message_size_bytes: [] | [bigint];
    cycles_for_archive_creation: [] | [bigint];
    node_max_memory_size_bytes: [] | [bigint];
    controller_id: Principal;
}
/**
 * Interface representing a range of archived blocks.
 * @typedef {Object} ArchivedBlocksRange
 * @property {[Principal, string]} callback - The callback function to execute.
 * @property {bigint} start - The starting index of the range.
 * @property {bigint} length - The length of the range.
 */
export interface ArchivedBlocksRange {
    callback: [Principal, string];
    start: bigint;
    length: bigint;
}
/**
* Interface representing a range of archived encoded blocks.
* @typedef {Object} ArchivedEncodedBlocksRange
* @property {[Principal, string]} callback - The callback function to be executed.
* @property {bigint} start - The starting index of the range.
* @property {bigint} length - The length of the range.
*/
export interface ArchivedEncodedBlocksRange {
    callback: [Principal, string];
    start: bigint;
    length: bigint;
}
/**
 * Interface for representing a collection of archive information.
 * @typedef {Object} Archives
 * @property {Array<ArchiveInfo>} archives - An array containing information about the archives.
 */
export interface Archives {
    archives: Array<ArchiveInfo>;
}
/**
 * Interface representing the arguments for fetching binary account balance
 * @typedef {Object} BinaryAccountBalanceArgs
 * @property {Uint8Array | number[]} account - The account identifier as a Uint8Array or number array
 */
export interface BinaryAccountBalanceArgs {
    account: Uint8Array | number[];
}
/**
 * Interface representing a range of blocks.
 * @typedef {Object} BlockRange
 * @property {Array<CandidBlock>} blocks - An array of CandidBlock objects representing the blocks in the range.
 */
export interface BlockRange {
    blocks: Array<CandidBlock>;
}
/**
 * Interface representing a CandidBlock object.
 * @typedef {Object} CandidBlock
 * @property {CandidTransaction} transaction - The transaction associated with the block.
 * @property {TimeStamp} timestamp - The timestamp of the block.
 * @property {Uint8Array | number[]} parent_hash - The hash of the parent block.
 */
export interface CandidBlock {
    transaction: CandidTransaction;
    timestamp: TimeStamp;
    parent_hash: [] | [Uint8Array | number[]];
}
/**
 * Represents a union type for the different operations that can be performed on a Candid token.
 * @typedef {Object} CandidOperation
 * @property {Object} Approve Represents the 'Approve' operation with specific parameters.
 * @property {Tokens} Approve.fee The fee associated with the operation.
 * @property {Uint8Array | number[]} Approve.from The address or public key of the sender.
 * @property {bigint} Approve.allowance_e8s The allowance amount in e8s.
 * @property {Tokens} Approve.allowance The allowance amount in Tokens.
 * @property {[]| [Tokens]} Approve.expected_allowance The expected allowance amount in Tokens.
 * @property {[]| [TimeStamp]} Approve.expires_at The expiration timestamp of the operation.
 * @property {Uint8Array | number[]} Approve.spender The address or public key of the spender.
 * @property {Object} Burn Represents the 'Burn' operation with specific parameters.
 * @property {Uint8Array | number[]} Burn.from The address or public key of the sender.
 * @property {Tokens} Burn.amount The amount of tokens to be burned.
 * @property {[]| [Uint8Array | number[]]} Burn.spender The address or public key of the spender.
 * @property {Object} Mint Represents the 'Mint' operation with specific parameters.
 * @property {Uint8Array | number[]} Mint.to The address or public key of the recipient.
 * @property {Tokens} Mint.amount The amount of tokens to be minted.
 * @property {Object} Transfer Represents the 'Transfer' operation with specific parameters.
 * @property {Uint8Array | number[]} Transfer.to The address or public key of the recipient.
 * @property {Tokens} Transfer.fee The fee associated with the operation.
 * @property {Uint8Array | number[]} Transfer.from The address or public key of the sender.
 * @property {Tokens} Transfer.amount The amount of tokens to be transferred.
 * @property {[]| [Uint8Array | number[]]} Transfer.spender The address or public key of the spender.
 */
export type CandidOperation =
    | {
          Approve: {
              fee: Tokens;
              from: Uint8Array | number[];
              allowance_e8s: bigint;
              allowance: Tokens;
              expected_allowance: [] | [Tokens];
              expires_at: [] | [TimeStamp];
              spender: Uint8Array | number[];
          };
      }
    | {
          Burn: {
              from: Uint8Array | number[];
              amount: Tokens;
              spender: [] | [Uint8Array | number[]];
          };
      }
    | { Mint: { to: Uint8Array | number[]; amount: Tokens } }
    | {
          Transfer: {
              to: Uint8Array | number[];
              fee: Tokens;
              from: Uint8Array | number[];
              amount: Tokens;
              spender: [] | [Uint8Array | number[]];
          };
      };
/**
 * Interface representing a CandidTransaction.
 * @typedef {Object} CandidTransaction
 * @property {bigint} memo - The memo of the transaction.
 * @property {Uint8Array | number[]} icrc1_memo - The ICRC1 memo of the transaction.
 * @property {CandidOperation[]} operation - The operation of the transaction.
 * @property {TimeStamp} created_at_time - The timestamp when the transaction was created.
 */
export interface CandidTransaction {
    memo: bigint;
    icrc1_memo: [] | [Uint8Array | number[]];
    operation: [] | [CandidOperation];
    created_at_time: TimeStamp;
}
/**
 * Interface representing the structure of an object with a 'decimals' property.
 * @interface
 * @property {number} decimals - The number of decimal places.
 */
export interface Decimals {
    decimals: number;
}
/**
 * Interface representing a Duration with seconds and nanoseconds.
 * @typedef {Object} Duration
 * @property {bigint} secs - The seconds part of the duration.
 * @property {number} nanos - The nanoseconds part of the duration.
 */
export interface Duration {
    secs: bigint;
    nanos: number;
}
/**
 * Interface representing feature flags.
 * @interface
 * @property {boolean} icrc2 - Indicates if the icrc2 feature flag is enabled.
 */
export interface FeatureFlags {
    icrc2: boolean;
}
/**
 * Interface representing arguments for getting blocks.
 * @property {bigint} start - The starting index for the blocks.
 * @property {bigint} length - The number of blocks to retrieve.
 */
export interface GetBlocksArgs {
    start: bigint;
    length: bigint;
}
/**
 * Type definition for possible errors when attempting to get blocks.
 * @typedef {Object} GetBlocksError
 * @property {Object} BadFirstBlockIndex - Error object when the first block index is invalid
 * @property {bigint} BadFirstBlockIndex.requested_index - The requested block index that caused the error
 * @property {bigint} BadFirstBlockIndex.first_valid_index - The first valid block index
 * @property {Object} Other - Other type of error object
 * @property {string} Other.error_message - The error message for the other type of error
 * @property {bigint} Other.error_code - The error code for the other type of error
 */
export type GetBlocksError =
    | {
          BadFirstBlockIndex: {
              requested_index: bigint;
              first_valid_index: bigint;
          };
      }
    | { Other: { error_message: string; error_code: bigint } };
/**
 * Interface for initializing arguments.
 *
 * @typedef {Object} InitArgs
 * @property {Array<Principal>} send_whitelist - Array of whitelisted principals
 * @property {[] | [string]} token_symbol - Token symbol
 * @property {[] | [Tokens]} transfer_fee - Transfer fee
 * @property {string} minting_account - Minting account
 * @property {[] | [bigint]} maximum_number_of_accounts - Maximum number of accounts
 * @property {[] | [bigint]} accounts_overflow_trim_quantity - Accounts overflow trim quantity
 * @property {[] | [Duration]} transaction_window - Transaction window duration
 * @property {[] | [bigint]} max_message_size_bytes - Maximum message size in bytes
 * @property {[] | [Account]} icrc1_minting_account - Icrc1 minting account
 * @property {[] | [ArchiveOptions]} archive_options - Archive options
 * @property {Array<[string, Tokens]>} initial_values - Initial values
 * @property {[] | [string]} token_name - Token name
 * @property {[] | [FeatureFlags]} feature_flags - Feature flags
 */

export interface InitArgs {
    send_whitelist: Array<Principal>;
    token_symbol: [] | [string];
    transfer_fee: [] | [Tokens];
    minting_account: string;
    maximum_number_of_accounts: [] | [bigint];
    accounts_overflow_trim_quantity: [] | [bigint];
    transaction_window: [] | [Duration];
    max_message_size_bytes: [] | [bigint];
    icrc1_minting_account: [] | [Account];
    archive_options: [] | [ArchiveOptions];
    initial_values: Array<[string, Tokens]>;
    token_name: [] | [string];
    feature_flags: [] | [FeatureFlags];
}
/**
 * Type definition for payload sent to the Ledger canister.
 * @typedef {Object} LedgerCanisterPayload
 * @property {Array[]} Upgrade - Payload for upgrading the Ledger canister
 * @property {Array[]} UpgradeArgs - Arguments for the Upgrade payload
 * @property {Object} Init - Payload for initializing the Ledger canister
 * @property {Object} InitArgs - Arguments for the Init payload
 */
export type LedgerCanisterPayload =
    | { Upgrade: [] | [UpgradeArgs] }
    | { Init: InitArgs };
/**
 * Represents the possible types of metadata values.
 * @typedef {Object} MetadataValue
 * @property {bigint} Int - Represents an integer value.
 * @property {bigint} Nat - Represents a natural number value.
 * @property {Uint8Array | number[]} Blob - Represents a binary blob value.
 * @property {string} Text - Represents a text value.
 */ 

export type MetadataValue =
    | { Int: bigint }
    | { Nat: bigint }
    | { Blob: Uint8Array | number[] }
    | { Text: string };
/**
 * Interface representing a name with a string value.
 * @typedef {Object} Name
 * @property {string} name - The name value.
 */ 

export interface Name {
    name: string;
}
/**
 * Interface representing the response object when querying blocks.
 *
 * @typedef {Object} QueryBlocksResponse
 * @property {Array} certificate - The certificate array containing Uint8Array or number arrays.
 * @property {Array<CandidBlock>} blocks - Array of CandidBlock objects.
 * @property {bigint} chain_length - The length of the blockchain.
 * @property {bigint} first_block_index - The index of the first block.
 * @property {Array<ArchivedBlocksRange>} archived_blocks - Array of ArchivedBlocksRange objects.
 */
export interface QueryBlocksResponse {
    certificate: [] | [Uint8Array | number[]];
    blocks: Array<CandidBlock>;
    chain_length: bigint;
    first_block_index: bigint;
    archived_blocks: Array<ArchivedBlocksRange>;
}
/**
 * Interface for the response object when querying encoded blocks.
 *
 * @typedef {Object} QueryEncodedBlocksResponse
 * @property {Array} certificate - An array containing either an empty array or an array of Uint8Array or number arrays.
 * @property {Array} blocks - An array containing Uint8Array or number arrays.
 * @property {bigint} chain_length - The length of the blockchain.
 * @property {bigint} first_block_index - The index of the first block.
 * @property {Array<ArchivedEncodedBlocksRange>} archived_blocks - An array of ArchivedEncodedBlocksRange objects.
 */
export interface QueryEncodedBlocksResponse {
    certificate: [] | [Uint8Array | number[]];
    blocks: Array<Uint8Array | number[]>;
    chain_length: bigint;
    first_block_index: bigint;
    archived_blocks: Array<ArchivedEncodedBlocksRange>;
}
/**
 * Represents the result of an operation, which can be either successful with a bigint value or failed with a TransferError object.
 * @typedef {Object} Result
 * @property {bigint} Ok - The successful result containing a bigint value
 * @property {TransferError} Err - The failed result containing a TransferError object
 */ 
```
export type Result = { Ok: bigint } | { Err: TransferError };
/**
* Represents a type that can either be a success with a bigint value or an error with an ApproveError object.
* @typedef {{ Ok: bigint } | { Err: ApproveError }} Result_1
*/
export type Result_1 = { Ok: bigint } | { Err: ApproveError };
/**
 * Type representing a result that can either be { Ok: bigint } or { Err: TransferFromError }.
 */
```
export type Result_2 = { Ok: bigint } | { Err: TransferFromError };
/**
 * Definition of a Result type that can either be Ok with a BlockRange object or Err with a GetBlocksError object.
 */
export type Result_3 = { Ok: BlockRange } | { Err: GetBlocksError };
/**
 * Represents a Result_4 type which can either be Ok with an array of Uint8Array or number arrays,
 * or Err with a GetBlocksError.
 */
export type Result_4 =
    | { Ok: Array<Uint8Array | number[]> }
    | { Err: GetBlocksError };
/**
 * Define a type Result_5 which can either have a property Ok with a value of type bigint 
 * or a property Err with a value of type TransferError_1.
 */
export type Result_5 = { Ok: bigint } | { Err: TransferError_1 };
/**
 * Interface for defining the arguments required to send a transaction.
 * @typedef {Object} SendArgs
 * @property {string} to - The recipient of the transaction.
 * @property {Tokens} fee - The fee to pay for the transaction.
 * @property {bigint} memo - A unique identifier for the transaction.
 * @property {Array} from_subaccount - The subaccount or subaccounts the transaction is coming from.
 * @property {Array} created_at_time - The timestamp when the transaction was created.
 * @property {Tokens} amount - The amount of tokens to send in the transaction.
 */
export interface SendArgs {
    to: string;
    fee: Tokens;
    memo: bigint;
    from_subaccount: [] | [Uint8Array | number[]];
    created_at_time: [] | [TimeStamp];
    amount: Tokens;
}
/**
 * Interface representing a standard record with a URL and a name.
 * @typedef {Object} StandardRecord
 * @property {string} url - The URL of the record.
 * @property {string} name - The name of the record.
 */
export interface StandardRecord {
    url: string;
    name: string;
}
/**
 * Interface representing a Symbol with a string symbol property.
 */
export interface Symbol {
    symbol: string;
}
/**
 * Interface representing a timestamp with nanosecond precision.
 * @typedef TimeStamp
 * @property {bigint} timestamp_nanos - The value of the timestamp in nanoseconds.
 */
export interface TimeStamp {
    timestamp_nanos: bigint;
}
/**
 * Interface for Tokens containing the amount of e8s as a bigint.
 */
export interface Tokens {
    e8s: bigint;
}
/**
 * Interface representing the arguments required for transferring an amount from one account to another.
 *
 * @property {Account} to - The recipient account for the transfer.
 * @property {Array[]} fee - An empty array or an array containing a single element of type bigint representing the fee for the transfer.
 * @property {Array[]} memo - An empty array or an array containing a single element of type Uint8Array or number[] representing the memo for the transfer.
 * @property {Array[]} from_subaccount - An empty array or an array containing a single element of type Uint8Array or number[] representing the subaccount from which the transfer is being made.
 * @property {Array[]} created_at_time - An empty array or an array containing a single element of type bigint representing the timestamp of when the transfer was created.
 * @property {bigint} amount - The amount to be transferred.
 */
export interface TransferArg {
    to: Account;
    fee: [] | [bigint];
    memo: [] | [Uint8Array | number[]];
    from_subaccount: [] | [Uint8Array | number[]];
    created_at_time: [] | [bigint];
    amount: bigint;
}
/**
 * Interface representing the arguments required for transferring tokens.
 * @typedef {Object} TransferArgs
 * @property {Uint8Array | number[]} to - The recipient's address as a Uint8Array or number array.
 * @property {Tokens} fee - The fee amount in tokens.
 * @property {bigint} memo - The memo for the transfer.
 * @property {[] | [Uint8Array | number[]]} from_subaccount - The subaccount array of the sender.
 * @property {[] | [TimeStamp]} created_at_time - The array of timestamps when the transfer was created.
 * @property {Tokens} amount - The amount of tokens to be transferred.
 */
export interface TransferArgs {
    to: Uint8Array | number[];
    fee: Tokens;
    memo: bigint;
    from_subaccount: [] | [Uint8Array | number[]];
    created_at_time: [] | [TimeStamp];
    amount: Tokens;
}
/**
 * Represents the possible errors that can occur during a transfer.
 * @typedef {Object} TransferError
 * @property {Object} GenericError - Error with a generic message and error code.
 * @property {string} GenericError.message - The error message.
 * @property {bigint} GenericError.error_code - The error code.
 * @property {null} TemporarilyUnavailable - Indicates that the transfer is temporarily unavailable.
 * @property {Object} BadBurn - Error related to a bad burn amount.
 * @property {bigint} BadBurn.min_burn_amount - The minimum burn amount allowed.
 * @property {Object} Duplicate - Indicates that the transfer is a duplicate of another.
 * @property {bigint} Duplicate.duplicate_of - The ID of the duplicated transfer.
 * @property {Object} BadFee - Error related to a bad fee amount.
 * @property {bigint} BadFee.expected_fee - The expected fee amount.
 * @property {Object} CreatedInFuture - Indicates that the transfer was created in the future.
 * @property {bigint} CreatedInFuture.ledger_time - The time in the ledger when the transfer was created.
 * @property {null} TooOld - Indicates that the transfer is too old.
 * @property {Object} InsufficientFunds - Error indicating that there are insufficient funds for the transfer.
 * @property {bigint} InsufficientFunds.balance - The current balance available.
 */
export type TransferError =
    | {
          GenericError: { message: string; error_code: bigint };
      }
    | { TemporarilyUnavailable: null }
    | { BadBurn: { min_burn_amount: bigint } }
    | { Duplicate: { duplicate_of: bigint } }
    | { BadFee: { expected_fee: bigint } }
    | { CreatedInFuture: { ledger_time: bigint } }
    | { TooOld: null }
    | { InsufficientFunds: { balance: bigint } };
/**
 * Definition of TransferError_1 type, which can represent various error scenarios that can occur during a transfer.
 * Contains possible error types:
 * - TxTooOld: Indicates the transaction is too old, with information on the allowed window in nanoseconds.
 * - BadFee: Indicates an issue with the expected fee amount.
 * - TxDuplicate: Indicates that the transaction is a duplicate.
 * - TxCreatedInFuture: Indicates that the transaction was created in the future.
 * - InsufficientFunds: Indicates that there are insufficient funds to complete the transfer, with information on the account balance.
 */
export type TransferError_1 =
    | {
          TxTooOld: { allowed_window_nanos: bigint };
      }
    | { BadFee: { expected_fee: Tokens } }
    | { TxDuplicate: { duplicate_of: bigint } }
    | { TxCreatedInFuture: null }
    | { InsufficientFunds: { balance: Tokens } };
/**
 * Interface representing a TransferFee object.
 * @interface
 * @property {Tokens} transfer_fee - The transfer fee amount in Tokens.
 */
export interface TransferFee {
    transfer_fee: Tokens;
}
/**
 * Interface representing the arguments for transferring assets from one account to another.
 * @typedef {Object} TransferFromArgs
 * @property {Account} to - The account to transfer the assets to.
 * @property {[] | [bigint]} fee - The fee for the transfer, if applicable.
 * @property {[] | [Uint8Array | number[]]} spender_subaccount - The subaccount for the spender, if applicable.
 * @property {Account} from - The account to transfer the assets from.
 * @property {[] | [Uint8Array | number[]]} memo - The memo for the transfer, if applicable.
 * @property {[] | [bigint]} created_at_time - The time the transfer was created, if applicable.
 * @property {bigint} amount - The amount of assets to transfer.
 */
export interface TransferFromArgs {
    to: Account;
    fee: [] | [bigint];
    spender_subaccount: [] | [Uint8Array | number[]];
    from: Account;
    memo: [] | [Uint8Array | number[]];
    created_at_time: [] | [bigint];
    amount: bigint;
}
/**
 * Definition of errors that can occur during a transferFrom operation.
 * @typedef {object} TransferFromError
 * @property {object} GenericError - Error object with a message and error code.
 * @property {string} GenericError.message - The error message.
 * @property {BigInt} GenericError.error_code - The error code as a BigInt.
 * @property {null} TemporarilyUnavailable - Indicates that the operation is temporarily unavailable.
 * @property {object} InsufficientAllowance - Error object indicating insufficient allowance.
 * @property {BigInt} InsufficientAllowance.allowance - The insufficient allowance amount as a BigInt.
 * @property {object} BadBurn - Error object indicating a bad burn with a minimum burn amount.
 * @property {BigInt} BadBurn.min_burn_amount - The minimum burn amount as a BigInt.
 * @property {object} Duplicate - Error object indicating a duplicate of a specified value.
 * @property {BigInt} Duplicate.duplicate_of - The duplicated value as a BigInt.
 * @property {object} BadFee - Error object indicating a bad fee with an expected fee amount.
 * @property {BigInt} BadFee.expected_fee - The expected fee amount as a BigInt.
 * @property {object} CreatedInFuture - Error object indicating a creation in the future with a ledger time.
 * @property {BigInt} CreatedInFuture.ledger_time - The ledger time associated with the creation in the future.
 * @property {null} TooOld - Indicates that the operation is too old to be processed.
 * @property {object} InsufficientFunds - Error object indicating insufficient funds with a balance amount.
 * @property {BigInt} InsufficientFunds.balance - The insufficient balance amount as a BigInt.
 */
export type TransferFromError =
    | {
          GenericError: { message: string; error_code: bigint };
      }
    | { TemporarilyUnavailable: null }
    | { InsufficientAllowance: { allowance: bigint } }
    | { BadBurn: { min_burn_amount: bigint } }
    | { Duplicate: { duplicate_of: bigint } }
    | { BadFee: { expected_fee: bigint } }
    | { CreatedInFuture: { ledger_time: bigint } }
    | { TooOld: null }
    | { InsufficientFunds: { balance: bigint } };
/**
 * Interface representing arguments for an upgrade operation.
 * @typedef {Object} UpgradeArgs
 * @property {Array} maximum_number_of_accounts - The maximum number of accounts.
 * @property {Array<Account>} icrc1_minting_account - The ICRC1 minting account.
 * @property {Array<FeatureFlags>} feature_flags - The feature flags.
 */
export interface UpgradeArgs {
    maximum_number_of_accounts: [] | [bigint];
    icrc1_minting_account: [] | [Account];
    feature_flags: [] | [FeatureFlags];
}
/**
 * Interface representing _SERVICE with various actor methods
 * @interface
 * @public
 */
export interface _SERVICE {
    account_balance: ActorMethod<[BinaryAccountBalanceArgs], Tokens>;
    account_balance_dfx: ActorMethod<[AccountBalanceArgs], Tokens>;
    account_identifier: ActorMethod<[Account], Uint8Array | number[]>;
    archives: ActorMethod<[], Archives>;
    decimals: ActorMethod<[], Decimals>;
    icrc1_balance_of: ActorMethod<[Account], bigint>;
    icrc1_decimals: ActorMethod<[], number>;
    icrc1_fee: ActorMethod<[], bigint>;
    icrc1_metadata: ActorMethod<[], Array<[string, MetadataValue]>>;
    icrc1_minting_account: ActorMethod<[], [] | [Account]>;
    icrc1_name: ActorMethod<[], string>;
    icrc1_supported_standards: ActorMethod<[], Array<StandardRecord>>;
    icrc1_symbol: ActorMethod<[], string>;
    icrc1_total_supply: ActorMethod<[], bigint>;
    icrc1_transfer: ActorMethod<[TransferArg], Result>;
    icrc2_allowance: ActorMethod<[AllowanceArgs], Allowance>;
    icrc2_approve: ActorMethod<[ApproveArgs], Result_1>;
    icrc2_transfer_from: ActorMethod<[TransferFromArgs], Result_2>;
    name: ActorMethod<[], Name>;
    query_blocks: ActorMethod<[GetBlocksArgs], QueryBlocksResponse>;
    query_encoded_blocks: ActorMethod<
        [GetBlocksArgs],
        QueryEncodedBlocksResponse
    >;
    send_dfx: ActorMethod<[SendArgs], bigint>;
    symbol: ActorMethod<[], Symbol>;
    transfer: ActorMethod<[TransferArgs], Result_5>;
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    transfer_fee: ActorMethod<[{}], TransferFee>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
