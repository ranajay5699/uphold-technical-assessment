import axios from "axios";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const BASE_URL = "https://api-sandbox.uphold.com";
const rl = readline.createInterface({ input, output });

const lastPrices = new Map();
let priceThreshold = 0.01;

/**
 * Fetches ticker data for a given currency pair and logs if there's a price change
 * @param {string} currencyPair 
 */
async function checkTicker(currencyPair) {
    try {
        const response = await axios.get(`${BASE_URL}/v0/ticker/${currencyPair}`);
        const currentPrice = parseFloat(response.data.ask);
        const lastPrice = lastPrices.get(currencyPair) || 0;
        const difference = currentPrice - lastPrice;

        if (Math.abs(difference) > priceThreshold) {
            console.log(`Price change detected for ${currencyPair}: ${lastPrice} => ${currentPrice} (Change: ${difference})`);
            lastPrices.set(currencyPair, currentPrice);
        }
    } catch (error) {
        console.error(`Error fetching data for ${currencyPair}: ${error}`);
    }
}

/**
 * Takes an array of currency pairs and checks their tickers concurrently
 * @param {String[]} currencyPairs 
 * @returns 
 */
async function checkAllTickers(currencyPairs) {
    const fetchPromises = currencyPairs.map(pair => checkTicker(pair));
    return Promise.all(fetchPromises);
}

async function main() {
    let checkIntervalMs = 5000;
    let currencyPairs = ["BTC-USD"];
    const enteredPairs = await rl.question(`Please enter the currency pairs to monitor (comma-separated) Ex: "BTC-USD,ETH-USD,LTC-USD" [Default=BTC-USD]: `);
    if (enteredPairs.trim()) {
        currencyPairs = enteredPairs.split(',').map(pair => pair.trim());
    }

    const enteredInterval = await rl.question(`Please enter the interval to monitor in milliseconds [Default=5000]: `); 
    if (enteredInterval.trim()) {
        checkIntervalMs = parseInt(enteredInterval);
    }

    const enteredThreshold = await rl.question(`Please enter the price threshold for the alert [Default=0.01]: `); 
    if (enteredThreshold.trim()) {
        priceThreshold = parseFloat(enteredThreshold);
    }

    console.log(`Monitoring currency pairs: ${currencyPairs.join(', ')} every ${checkIntervalMs} ms, with price threshold: ${priceThreshold}`);
    rl.close();

    // Set axios timeout slightly less than the check interval to avoid overlaps
    axios.defaults.timeout = (checkIntervalMs > 1000) ? checkIntervalMs - 1000 : 1000;

    setInterval(async () => {
        await checkAllTickers(currencyPairs)
    }, checkIntervalMs);
}

main();