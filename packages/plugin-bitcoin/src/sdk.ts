// @ts-ignore
let InMemoryKey: any;
let Wallet: any;

async function initSDK() {
    const sdk = await import('@arklabs/wallet-sdk');
    InMemoryKey = sdk.InMemoryKey;
    Wallet = sdk.Wallet;
}

// Initialize the SDK
initSDK().catch(console.error);

export { InMemoryKey, Wallet }