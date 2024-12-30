// Network types
export type NetworkName = 'bitcoin' | 'testnet' | 'signet' | 'mutinynet';

// Action parameters
export interface SendBitcoinParams {
  address: string;
  amount?: number; // in satoshis, optional if sendAll is true
  amountUSD?: number; // amount in USD
  sendAll?: boolean; // if true, sends all available funds minus fee
  feeRate?: number; // sats/vbyte, optional
  message?: string; // optional message for the transaction
}

// Price types
export interface BitcoinPrice {
  USD: {
    "15m": number;
    last: number;
    buy: number;
    sell: number;
    symbol: string;
  };
}

// Configuration
export interface BitcoinConfig {
  privateKey: string;
  network: NetworkName;
  arkServerUrl?: string;
  arkServerPubKey?: string;
}
