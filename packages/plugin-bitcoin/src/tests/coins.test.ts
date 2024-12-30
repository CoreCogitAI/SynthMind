import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BitcoinTaprootProvider } from "../providers/bitcoin";
import { coinsAction } from "../actions/coins";
import { IAgentRuntime, Memory, State } from "@elizaos/core";

describe("coinsAction", () => {
    beforeEach(() => {
        // Silence console.error for expected errors
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockProvider = {
        wallet: {
            getCoins: async () => [
                {
                    txid: "tx1",
                    vout: 0,
                    value: 1000,
                    status: { confirmed: true },
                },
                {
                    txid: "tx1",
                    vout: 1,
                    value: 3000,
                    status: { confirmed: true },
                },
                {
                    txid: "tx2",
                    vout: 1,
                    value: 2000,
                    status: { confirmed: false },
                },
            ],
        },
    } as unknown as BitcoinTaprootProvider;

    Object.setPrototypeOf(mockProvider, BitcoinTaprootProvider.prototype);

    const mockRuntime = {
        providers: [mockProvider],
        getSetting: () => undefined,
    } as unknown as IAgentRuntime;

    const mockMessage: Memory = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        agentId: "123e4567-e89b-12d3-a456-426614174001",
        roomId: "123e4567-e89b-12d3-a456-426614174002",
        content: { text: "Show my coins" },
    };

    const mockState = {} as State;

    it("should validate with bitcoin provider", async () => {
        expect(
            await coinsAction.validate(mockRuntime, mockMessage, mockState)
        ).toBe(true);
    });

    it("should display confirmed UTXOs correctly", async () => {
        const result = (await coinsAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {}
        )) as { text: string };
        expect(result.text).toMatch(/4000.*sats/);
        expect(result.text).toMatch(/tx1.*0.*1000.*sats/);
        expect(result.text).toMatch(/tx1.*1.*3000.*sats/);
    });

    it("should display unconfirmed UTXOs correctly", async () => {
        const result = (await coinsAction.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {}
        )) as { text: string };
        expect(result.text).toMatch(/2000.*sats/);
        expect(result.text).toMatch(/tx2.*1.*2000.*sats/);
    });

    it("should handle empty wallet state", async () => {
        const emptyProvider = {
            wallet: {
                getCoins: async () => [],
            },
        } as unknown as BitcoinTaprootProvider;
        Object.setPrototypeOf(emptyProvider, BitcoinTaprootProvider.prototype);

        const emptyRuntime = {
            providers: [emptyProvider],
            getSetting: () => undefined,
        } as unknown as IAgentRuntime;

        const result = (await coinsAction.handler(
            emptyRuntime,
            mockMessage,
            mockState,
            {}
        )) as { text: string };
        expect(result.text).toMatch(/No confirmed/i);
        expect(result.text).toMatch(/No unconfirmed/i);
    });

    it("should handle missing bitcoin provider", async () => {
        const noProviderRuntime = {
            providers: [],
            getSetting: () => undefined,
        } as unknown as IAgentRuntime;

        const result = (await coinsAction.handler(
            noProviderRuntime,
            mockMessage,
            mockState,
            {}
        )) as { text: string };
        expect(result.text).toMatch(/provider not found/i);
        expect(result.text).toMatch(/configuration/i);
    });

    it("should handle provider error gracefully", async () => {
        const errorProvider = {
            wallet: {
                getCoins: async () => {
                    throw new Error("Failed to fetch coins");
                },
            },
        } as unknown as BitcoinTaprootProvider;
        Object.setPrototypeOf(errorProvider, BitcoinTaprootProvider.prototype);

        const errorRuntime = {
            providers: [errorProvider],
            getSetting: () => undefined,
        } as unknown as IAgentRuntime;

        const result = (await coinsAction.handler(
            errorRuntime,
            mockMessage,
            mockState,
            {}
        )) as { text: string };
        expect(result.text).toMatch(/unable to fetch.*coins/i);
    });
});
