import axios from "axios";

const PRICE_THRESHOLD = 0.01; 
const BASE_URL = "https://api-sandbox.uphold.com";

const currencyPairs = ["BTC-USD", "ETH-USD", "LTC-USD"];
const checkIntervalMs = 5000; 
const lastPrices = new Map();

// Set axios timeout slightly less than the check interval to avoid overlaps
axios.defaults.timeout = (checkIntervalMs > 1000) ? checkIntervalMs - 1000 : 1000;

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

setInterval(async () => {
    await checkAllTickers(currencyPairs)
}, checkIntervalMs);