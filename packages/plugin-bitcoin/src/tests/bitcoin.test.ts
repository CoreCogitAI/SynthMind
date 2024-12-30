import { describe, it, expect, beforeEach, vi } from "vitest";
import { BitcoinTaprootProvider } from "../providers/bitcoin";
import { NetworkName } from "../types";
import { Wallet } from "@arklabs/wallet-sdk";

describe("BitcoinTaprootProvider", () => {
  let provider: BitcoinTaprootProvider;
  // Test private key (DO NOT USE IN PRODUCTION)
  const testPrivateKey = "ce66c68f8875c0c98a502c666303dc183a21600130013c06f9d1edf60207abf2";
  const testServerPubKey = "02eec7245d6b7d2ccb30380bfbe2a3648cd7a942653f5aa340edcea1f283686619";

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a new provider instance
    provider = new BitcoinTaprootProvider({
      privateKey: testPrivateKey,
      network: "mutinynet" as NetworkName,
      arkServerUrl: "https://mock.ark.server",
      arkServerPublicKey: testServerPubKey
    });
  });

  describe("Address Generation", () => {
    it("should generate valid onchain and offchain addresses", async () => {
      const addresses = await provider.getAddress();

      expect(addresses.onchain).toBeDefined();
      expect(addresses.onchain).toMatch(/^tb1/); // Testnet taproot address prefix
      expect(addresses.offchain).toBeDefined();
      expect(addresses.offchain).toMatch(/^tark/); // ARK address prefix
    });

    it("should generate consistent addresses for same private key", async () => {
      const addresses1 = await provider.getAddress();
      const addresses2 = await provider.getAddress();

      expect(addresses1.onchain).toBe(addresses2.onchain);
      expect(addresses1.offchain).toBe(addresses2.offchain);
    });
  });

  describe("Transaction Handling", () => {
    beforeEach(() => {
      // Silence console.error for expected errors
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it("should handle insufficient funds error", async () => {
      // Mock the wallet's getBalance method
      const mockWallet = {
        getBalance: vi.fn().mockResolvedValue({
          total: 0,
          onchain: {
            total: 0,
            confirmed: 0,
            unconfirmed: 0
          },
          offchain: {
            total: 0,
            settled: 0,
            pending: 0,
            swept: 0
          }
        }),
        sendBitcoin: vi.fn().mockRejectedValue(new Error("Insufficient funds"))
      } as unknown as Wallet;

      // Replace the provider's wallet with our mock
      (provider as any).wallet = mockWallet;

      const recipientAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";

      await expect(provider.sendBitcoin({
        address: recipientAddress,
        amount: 50000n
      })).rejects.toThrow("Insufficient funds");
    });

    it("should handle invalid Bitcoin address", async () => {
      // Use an obviously invalid address format
      const recipientAddress = "not_a_bitcoin_address";

      await expect(provider.sendBitcoin({
        address: recipientAddress,
        amount: 50000n
      })).rejects.toThrow("Invalid Bitcoin address");
    });

    it("should handle dust amount error", async () => {
      const recipientAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";

      await expect(provider.sendBitcoin({
        address: recipientAddress,
        amount: 100n // Below dust limit
      })).rejects.toThrow("Amount must be at least 546 sats (dust limit)");
    });
  });

  describe("Wallet Balance", () => {
    it("should handle balance retrieval", async () => {
      // Mock the wallet's getBalance method
      const mockWallet = {
        getBalance: vi.fn().mockResolvedValue({
          total: 1000,
          onchain: {
            total: 0,
            confirmed: 0,
            unconfirmed: 0
          },
          offchain: {
            total: 1000,
            settled: 1000,
            pending: 0,
            swept: 0
          }
        })
      } as unknown as Wallet;

      // Replace the provider's wallet with our mock
      (provider as any).wallet = mockWallet;

      const balance = await provider.getWalletBalance();
      expect(balance.total).toBe(1000);
      expect(balance.onchain.total).toBe(0);
      expect(balance.offchain.total).toBe(1000);
    });
  });
});