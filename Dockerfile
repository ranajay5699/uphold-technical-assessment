FROM node:25-alpine
WORKDIR /app
COPY package*.json .
COPY index.js .
RUN npm install

# Configure environment variables for customization
ENV CURRENCY_PAIRS="BTC-USD,ETH-USD,XRP-USD"
ENV CHECK_INTERVAL_MS=5000
ENV PRICE_THRESHOLD=20

CMD [ "npm", "start" ]
