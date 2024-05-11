# Stock Price Checker

The application should periodically check the prices and calculate the moving average of stocks, using Finnhub's data. 

## How to run

1. Create .env file 

    This file must contain the following variables to work:
    ```
    DATABASE_USERNAME
    DATABASE_PASSWORD
    DATABASE_HOST
    DATABASE_NAME
    FINNHUB_API_KEY
    ```
2. Run `docker compose up -d`

    `docker logs -f --tail 100 {database|webapp}` with this command you can see a rolling log for either the `database` or the `webapp` service

## How to use

Import `postman_collection.json` to Postman and call the endpoints from there, or go to `http://localhost:3000/api` and use from swagger UI.