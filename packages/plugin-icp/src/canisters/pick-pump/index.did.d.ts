import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

/**
 * Interface representing a Candle object.
 *
 * @typedef {Object} Candle
 * @property {number} low - The lowest price of the candle.
 * @property {number} high - The highest price of the candle.
 * @property {number} close - The closing price of the candle.
 * @property {number} open - The opening price of the candle.
 * @property {bigint} timestamp - The timestamp of the candle.
 */
export interface Candle {
    low: number;
    high: number;
    close: number;
    open: number;
    timestamp: bigint;
}
/**
 * Interface representing a comment object.
 * @typedef {Object} Comment
 * @property {string} creator - The creator of the comment.
 * @property {string} token - The token associated with the comment.
 * @property {string} content - The content of the comment.
 * @property {bigint} created_at - The timestamp when the comment was created.
 * @property {string[]} image - An array of strings representing images attached to the comment, or an empty array if no images are attached.
 */
export interface Comment {
    creator: string;
    token: string;
    content: string;
    created_at: bigint;
    image: [] | [string];
}
/**
 * Interface representing the arguments needed to create a comment.
 * @typedef {Object} CreateCommentArg
 * @property {string} token - The token of the user creating the comment.
 * @property {string} content - The content of the comment.
 * @property {Array<string>} image - An optional array containing the image URL of the comment. If no image is provided, it should be an empty array.
 */
export interface CreateCommentArg {
    token: string;
    content: string;
    image: [] | [string];
}
/**
 * Interface for creating a new MemeToken with the specified properties.
 * @typedef {object} CreateMemeTokenArg
 * @property {Array<string> | Array<string>} twitter - The Twitter handle of the token.
 * @property {string} logo - The logo of the token.
 * @property {string} name - The name of the token.
 * @property {string} description - The description of the token.
 * @property {Array<string> | Array<string>} website - The website of the token.
 * @property {Array<string> | Array<string>} telegram - The Telegram handle of the token.
 * @property {string} symbol - The symbol of the token.
 */
export interface CreateMemeTokenArg {
    twitter: [] | [string];
    logo: string;
    name: string;
    description: string;
    website: [] | [string];
    telegram: [] | [string];
    symbol: string;
}
/**
 * Interface representing a holder with balance and owner information.
 * @typedef {Object} Holder
 * @property {bigint} balance - The balance amount of the holder.
 * @property {string} owner - The name of the holder.
 */
export interface Holder {
    balance: bigint;
    owner: string;
}
/**
 * Interface for the initialization arguments required for setting up the token service.
 * @typedef {Object} InitArg
 * @property {Principal} fee_receiver - The principal ID of the fee receiver.
 * @property {Array<bigint>} create_token_fee - An array containing the fee for creating tokens, if applicable.
 * @property {Principal} icp_canister_id - The principal ID of the ICP canister.
 * @property {boolean} maintenance - A boolean representing if the token service is in maintenance mode.
 * @property {Array<number>} fee_percentage - An array containing the fee percentage, if applicable.
 */
export interface InitArg {
    fee_receiver: Principal;
    create_token_fee: [] | [bigint];
    icp_canister_id: Principal;
    maintenance: boolean;
    fee_percentage: [] | [number];
}
/**
 * Interface representing a Meme Token.
 * @typedef {Object} MemeToken
 * @property {bigint} id - The ID of the token.
 * @property {string} creator - The creator of the token.
 * @property {bigint} available_token - The number of available tokens.
 * @property {string[]} twitter - The Twitter handle associated with the token.
 * @property {bigint} volume_24h - The 24-hour trading volume of the token.
 * @property {string} logo - The URL for the token's logo.
 * @property {string} name - The name of the token.
 * @property {number} liquidity - The liquidity of the token.
 * @property {string} description - The description of the token.
 * @property {bigint} created_at - The timestamp when the token was created.
 * @property {string[]} website - The website associated with the token.
 * @property {bigint} last_tx_time - The timestamp of the last transaction.
 * @property {string[]} canister - The canister associated with the token.
 * @property {bigint} market_cap_icp - The market capitalization of the token in ICP.
 * @property {number} market_cap_usd - The market capitalization of the token in USD.
 * @property {number} price - The current price of the token.
 * @property {string[]} telegram - The Telegram handle associated with the token.
 * @property {string} symbol - The symbol of the token.
 */
export interface MemeToken {
    id: bigint;
    creator: string;
    available_token: bigint;
    twitter: [] | [string];
    volume_24h: bigint;
    logo: string;
    name: string;
    liquidity: number;
    description: string;
    created_at: bigint;
    website: [] | [string];
    last_tx_time: bigint;
    canister: [] | [string];
    market_cap_icp: bigint;
    market_cap_usd: number;
    price: number;
    telegram: [] | [string];
    symbol: string;
}
/**
 * Interface representing a MemeTokenView, which includes the token and the balance associated with it.
 * @typedef {Object} MemeTokenView
 * @property {MemeToken} token - The MemeToken object associated with the view.
 * @property {bigint} balance - The balance of the MemeToken.
 */
export interface MemeTokenView {
    token: MemeToken;
    balance: bigint;
}
/**
 * Type representing a Result that can either be Ok with a bigint value
 * or Err with a string value.
 */
export type Result = { Ok: bigint } | { Err: string };
/**
 * Type representing a result that can be either an object with key "Ok" containing a MemeToken or an object with key "Err" containing a string.
 */
export type Result_1 = { Ok: MemeToken } | { Err: string };
/**
 * Type for defining the sorting options for an array of items.
 * Can be one of the following:
 * - CreateTimeDsc: Sort by create time in descending order
 * - LastTradeDsc: Sort by last trade time in descending order
 * - MarketCapDsc: Sort by market capitalization in descending order
 */
export type Sort =
    | { CreateTimeDsc: null }
    | { LastTradeDsc: null }
    | { MarketCapDsc: null };
/**
 * Interface representing a transaction with details such as token amount, token ID, token symbol, sender address, timestamp, ICP amount, and transaction type.
 * @typedef {Object} Transaction
 * @property {bigint} token_amount - The amount of the token involved in the transaction.
 * @property {bigint} token_id - The ID of the token involved in the transaction.
 * @property {string} token_symbol - The symbol of the token involved in the transaction.
 * @property {string} from - The address of the sender in the transaction.
 * @property {bigint} timestamp - The timestamp of the transaction.
 * @property {bigint} icp_amount - The amount of ICP involved in the transaction.
 * @property {string} tx_type - The type of the transaction.
 */
export interface Transaction {
    token_amount: bigint;
    token_id: bigint;
    token_symbol: string;
    from: string;
    timestamp: bigint;
    icp_amount: bigint;
    tx_type: string;
}
/**
 * Interface representing a User object.
 * @property {string} principal - The principal of the user.
 * @property {string} name - The name of the user.
 * @property {bigint} last_login_seconds - The time of the user's last login in seconds.
 * @property {bigint} register_at_second - The time when the user registered in seconds.
 * @property {string} avatar - The URL of the user's avatar.
 */
export interface User {
    principal: string;
    name: string;
    last_login_seconds: bigint;
    register_at_second: bigint;
    avatar: string;
}
/**
 * Interface representing the result of a wallet receive operation.
 * @property {BigInt} accepted - The amount of funds accepted by the wallet.
 */
export interface WalletReceiveResult {
    accepted: bigint;
}
/**
 * Interface representing the _SERVICE contract.
 * This interface defines various actor methods for interacting with the contract.
 * Methods include buying, selling, creating tokens, querying information, etc.
 */
export interface _SERVICE {
    buy: ActorMethod<[bigint, number], Result>;
    calculate_buy: ActorMethod<[bigint, number], Result>;
    calculate_sell: ActorMethod<[bigint, number], Result>;
    create_token: ActorMethod<[CreateMemeTokenArg], Result_1>;
    king_of_hill: ActorMethod<[], [] | [MemeToken]>;
    last_txs: ActorMethod<[bigint], Array<Transaction>>;
    post_comment: ActorMethod<[CreateCommentArg], undefined>;
    query_all_tokens: ActorMethod<
        [bigint, bigint, [] | [Sort]],
        [Array<MemeToken>, bigint]
    >;
    query_token: ActorMethod<[bigint], [] | [MemeToken]>;
    query_token_candle: ActorMethod<[bigint, [] | [bigint]], Array<Candle>>;
    query_token_comments: ActorMethod<
        [Principal, bigint, bigint],
        [Array<Comment>, bigint]
    >;
    query_token_holders: ActorMethod<
        [bigint, bigint, bigint],
        [Array<Holder>, bigint]
    >;
    query_token_transactions: ActorMethod<
        [bigint, bigint, bigint],
        [Array<Transaction>, bigint]
    >;
    query_user: ActorMethod<[[] | [Principal]], User>;
    query_user_launched: ActorMethod<[[] | [Principal]], Array<MemeToken>>;
    query_user_tokens: ActorMethod<[[] | [Principal]], Array<MemeTokenView>>;
    sell: ActorMethod<[bigint, number], Result>;
    wallet_balance: ActorMethod<[], bigint>;
    wallet_receive: ActorMethod<[], WalletReceiveResult>;
}
export declare const idlFactory: IDL.InterfaceFactory;
