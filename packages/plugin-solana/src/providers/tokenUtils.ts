import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Retrieves the price of a token in SOL (Solana) from the Jupter API.
 * @param {string} tokenSymbol - The symbol of the token to get the price for.
 * @returns {Promise<number>} The current price of the token in SOL.
 */
export async function getTokenPriceInSol(tokenSymbol: string): Promise<number> {
    const response = await fetch(
        `https://price.jup.ag/v6/price?ids=${tokenSymbol}`
    );
    const data = await response.json();
    return data.data[tokenSymbol].price;
}

/**
 * Retrieves the balance of a specific token associated with a wallet.
 * @param {Connection} connection - The connection to the Solana blockchain.
 * @param {PublicKey} walletPublicKey - The public key of the wallet.
 * @param {PublicKey} tokenMintAddress - The mint address of the token.
 * @returns {Promise<number>} The balance of the token in the wallet.
 */
async function getTokenBalance(
    connection: Connection,
    walletPublicKey: PublicKey,
    tokenMintAddress: PublicKey
): Promise<number> {
    const tokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        walletPublicKey
    );

    try {
        const tokenAccount = await getAccount(connection, tokenAccountAddress);
        const tokenAmount = tokenAccount.amount as unknown as number;
        return tokenAmount;
    } catch (error) {
        console.error(
            `Error retrieving balance for token: ${tokenMintAddress.toBase58()}`,
            error
        );
        return 0;
    }
}

/**
 * Asynchronously retrieves the token balances for the specified wallet public key.
 * 
 * @param {Connection} connection - The connection to the Solana blockchain.
 * @param {PublicKey} walletPublicKey - The public key of the wallet to retrieve token balances for.
 * @returns {Promise<{ [tokenName: string]: number }>} An object mapping token names to their respective balances.
 */
async function getTokenBalances(
    connection: Connection,
    walletPublicKey: PublicKey
): Promise<{ [tokenName: string]: number }> {
    const tokenBalances: { [tokenName: string]: number } = {};

    // Add the token mint addresses you want to retrieve balances for
    const tokenMintAddresses = [
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
        new PublicKey("So11111111111111111111111111111111111111112"), // SOL
        // Add more token mint addresses as needed
    ];

    for (const mintAddress of tokenMintAddresses) {
        const tokenName = getTokenName(mintAddress);
        const balance = await getTokenBalance(
            connection,
            walletPublicKey,
            mintAddress
        );
        tokenBalances[tokenName] = balance;
    }

    return tokenBalances;
}

/**
 * Gets the token name based on the mint address.
 * @param {PublicKey} mintAddress - The mint address of the token.
 * @returns {string} The name of the token corresponding to the mint address, or "Unknown Token" if not found.
 */
function getTokenName(mintAddress: PublicKey): string {
    // Implement a mapping of mint addresses to token names
    const tokenNameMap: { [mintAddress: string]: string } = {
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
        So11111111111111111111111111111111111111112: "SOL",
        // Add more token mint addresses and their corresponding names
    };

    return tokenNameMap[mintAddress.toBase58()] || "Unknown Token";
}

export { getTokenBalance, getTokenBalances };
