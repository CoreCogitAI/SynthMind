import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { balanceAction } from "../actions/balance";
import { BitcoinPrice } from "../types";
import { IAgentRuntime } from "@elizaos/core";
import { BitcoinTaprootProvider } from "../providers/bitcoin";

interface ActionResponse {
    text: string;
}

describe("balanceAction", () => {
    beforeEach(() => {
        // Silence console.error for expected errors
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockProvider = {
        getWalletBalance: async () => ({
            total: 150000000,
            onchain: {
                total: 130000000,
                confirmed: 100000000,
                unconfirmed: 30000000,
            },
            offchain: {
                total: 20000000,
                settled: 20000000,
                pending: 0,
                swept: 0,
            },
        }),
        getBitcoinPrice: async () => ({
            USD: {
                last: 42000,
                "15m": 42000,
                buy: 42000,
                sell: 42000,
                symbol: "$",
            },
        }),
    } as unknown as BitcoinTaprootProvider;

    // Set up instanceof check
    Object.setPrototypeOf(mockProvider, BitcoinTaprootProvider.prototype);

    const mockRuntime = {
        providers: [mockProvider],
    } as unknown as IAgentRuntime;

    it("should return formatted balance with USD conversion", async () => {
        const result = (await balanceAction.handler(
            mockRuntime,
            {} as any,
            {} as any,
            {}
        )) as ActionResponse;

        // Check for balance in sats
        expect(result.text).toContain("150,000,000 sats");

        // Check for USD values
        expect(result.text).toContain("$54600.00"); // Onchain (130M sats)
        expect(result.text).toContain("$8400.00"); // Offchain (20M sats)
        expect(result.text).toContain("$63000.00"); // Total (150M sats)
    });

    it("should handle errors gracefully", async () => {
        const errorProvider = {
            getWalletBalance: async () => {
                throw new Error("Failed to fetch balance");
            },
            getBitcoinPrice: async () => ({
                USD: {
                    last: 42000,
                    "15m": 42000,
                    buy: 42000,
                    sell: 42000,
                    symbol: "$",
                },
            }),
        } as unknown as BitcoinTaprootProvider;

        // Set up instanceof check for error provider
        Object.setPrototypeOf(errorProvider, BitcoinTaprootProvider.prototype);

        const errorRuntime = {
            providers: [errorProvider],
        } as unknown as IAgentRuntime;

        const result = (await balanceAction.handler(
            errorRuntime,
            {} as any,
            {} as any,
            {}
        )) as ActionResponse;
        expect(result.text).toBe(
            "Unable to fetch your Bitcoin balance at the moment. Please try again later."
        );
    });
});
