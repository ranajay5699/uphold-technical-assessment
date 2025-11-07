import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://api-sandbox.uphold.com";
const lastPrices = new Map();

const CURRENCY_PAIRS = process.env.CURRENCY_PAIRS
  ? process.env.CURRENCY_PAIRS.split(",")
  : ["BTC-USD"];
const CHECK_INTERVAL_MS = process.env.CHECK_INTERVAL_MS
  ? parseInt(process.env.CHECK_INTERVAL_MS)
  : 5000;
const PRICE_THRESHOLD = process.env.PRICE_THRESHOLD
  ? parseFloat(process.env.PRICE_THRESHOLD)
  : 0.01;

// Set axios timeout slightly less than the check interval to avoid overlaps
axios.defaults.timeout = (CHECK_INTERVAL_MS > 1000) ? CHECK_INTERVAL_MS - 1000 : 1000;

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

        if (Math.abs(difference) > PRICE_THRESHOLD) {
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
  console.log(`Monitoring currency pairs: ${CURRENCY_PAIRS.join(', ')} every ${CHECK_INTERVAL_MS} ms, with price threshold: ${PRICE_THRESHOLD}`);
  setInterval(async () => {
      await checkAllTickers(CURRENCY_PAIRS)
  }, CHECK_INTERVAL_MS);
}

main();

//Export functions for testing
export { main, checkTicker, checkAllTickers};