import { IAgentRuntime, Memory, State } from "@elizaos/core";

export interface BitcoinConfig {
    privateKey: string;
    network: "bitcoin" | "testnet" | "mutinynet" | "regtest" | "signet";
    arkServerPublicKey?: string;
    arkServerUrl?: string;
}

export interface SendBitcoinParams {
    address: string;
    amount?: bigint; // in satoshis, optional if sendAll is true
    amountUSD?: number; // amount in USD
    sendAll?: boolean; // if true, sends all available funds minus fee
    feeRate?: number; // sats/vbyte, optional
}

export interface BitcoinPrice {
    [currency: string]: {
        "15m": number;
        last: number;
        buy: number;
        sell: number;
        symbol: string;
    };
}
