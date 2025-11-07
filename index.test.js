import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import dotenv from "dotenv";
import { main, checkTicker } from './index.js';

dotenv.config();
vi.mock("axios");

describe("Index.js Module", () => {

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    describe("checkTicker", () => {
        it("should log price change if the difference exceeds the threshold", async () => {
            const currencyPair = "BTC-USD";
            const mockResponse = { data: { ask: "50000.01" } };
            axios.get.mockResolvedValue(mockResponse);

            const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { });
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

            await checkTicker(currencyPair);

            expect(axios.get).toHaveBeenCalledWith(
                "https://api-sandbox.uphold.com/v0/ticker/BTC-USD"
            );
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining("Price change detected for BTC-USD")
            );
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it("should log an error if the API call fails", async () => {
            const currencyPair = "BTC-USD";
            axios.get.mockRejectedValue(new Error("API error"));

            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

            await checkTicker(currencyPair);

            expect(axios.get).toHaveBeenCalledWith(
                "https://api-sandbox.uphold.com/v0/ticker/BTC-USD"
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Error fetching data for BTC-USD")
            );
        });

    });

    describe("main", () => {
        it("should log the monitoring message with correct details", async () => {
            const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { });
            const setIntervalSpy = vi.spyOn(global, "setInterval").mockImplementation(() => { });
            process.env.CURRENCY_PAIRS = "BTC-USD,ETH-USD,XRP-USD";
            process.env.CHECK_INTERVAL_MS = "6000";
            process.env.PRICE_THRESHOLD = "20";

            const { main } = await import('./index.js');
            await main();

            expect(consoleLogSpy).toHaveBeenCalledWith(
                `Monitoring currency pairs: BTC-USD, ETH-USD, XRP-USD every 6000 ms, with price threshold: 20`
            );
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 6000);

            consoleLogSpy.mockRestore();
            setIntervalSpy.mockRestore();
        });

        it("should log the monitoring message with correct details but use default values", async () => {
            const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { });
            const setIntervalSpy = vi.spyOn(global, "setInterval").mockImplementation(() => { });
            process.env.CURRENCY_PAIRS = "";
            process.env.CHECK_INTERVAL_MS = "";
            process.env.PRICE_THRESHOLD = "";

            const { main } = await import('./index.js');
            await main();

            expect(consoleLogSpy).toHaveBeenCalledWith(
                `Monitoring currency pairs: BTC-USD every 5000 ms, with price threshold: 0.01`
            );
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

            consoleLogSpy.mockRestore();
            setIntervalSpy.mockRestore();
        });

        describe("checkAllTickers", () => {
            beforeEach(() => {
                vi.resetModules();
                vi.clearAllMocks();
            });

            it("should call checkTicker for each currency pair", async () => {
                const currencyPairs = ["BTC-USD", "ETH-USD", "XRP-USD"];
                const mockResponse = { data: { ask: "50000.01" } };
                axios.get.mockResolvedValue(mockResponse);

                // Import after mocking
                const { checkAllTickers } = await import('./index.js');
                await checkAllTickers(currencyPairs);

                expect(axios.get).toHaveBeenCalledTimes(currencyPairs.length);
                currencyPairs.forEach(pair => {
                    expect(axios.get).toHaveBeenCalledWith(`https://api-sandbox.uphold.com/v0/ticker/${pair}`);
                });
            });
        });
    });

});
