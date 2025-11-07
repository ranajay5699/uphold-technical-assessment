# Setup:
1. Register for the Uphold API and follow instructions to get client id and secret here: https://support.uphold.com/hc/en-us/articles/360000758226-How-to-use-the-Sandbox-Environment
2. Follow the instructions to get your client ID and Secret here: https://developer.uphold.com/get-started/quick-start#setting-up-sandbox
3. Create a `.env` file in the project root and add the following secret keys:
```
UPHOLD_CLIENT_SECRET=<Add Your Secret Key Here>
CURRENCY_PAIRS=<Comma-separated list of currency pairs (default: BTC-USD)>
CHECK_INTERVAL_MS=<Enter a whole number, not a decimal (default: 5000)> 
PRICE_THRESHOLD=<Enter any positive number (default: 0.01)>
```
4. `npm install`

# To Run:
```js
npm run start
```

## Notes 
- The "register their application" link on docs does not work anymore.
- The API endpoints required for this assessment are completely unauthenticated, not sure if this is intended. 