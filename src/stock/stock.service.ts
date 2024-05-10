import * as finnhub from 'finnhub';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Symbol } from '../entities/symbol.entity';
import { StockPrice } from '../entities/stock-price.entity';

import { FinnhubClientResponse, FinnhubStockQuote } from './stock.model';

@Injectable()
export class StockService {
    private readonly finnhubClient;

    constructor(
        @InjectRepository(Symbol)
        private readonly symbolRepository: Repository<Symbol>,
        @InjectRepository(StockPrice)
        private readonly stockPriceRepository: Repository<StockPrice>
    ) {
        const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        api_key.apiKey = "ciqlqj9r01qjff7cr300ciqlqj9r01qjff7cr30g";
        this.finnhubClient = new finnhub.DefaultApi();
    }

    public async getStockPrice(symbol: string) {
        const response = await this.fetchStockQuote(symbol);

        return response
    }

    public async addSymbol(symbol: string) {
        let quote: FinnhubStockQuote
        try {
            const response = await this.fetchStockQuote(symbol);

            quote = response.data;
        } catch (error) {
            if(error.message === 'Symbol not found') {
                throw new NotFoundException('Symbol not found');
            }

            throw new BadRequestException('Error while fetching stock info')
        }

        // Create symbol
        let symbolEntity = new Symbol();
        symbolEntity.symbol = symbol;
        symbolEntity = await this.symbolRepository.save(symbolEntity);

        // Create initial stock price
        let stockPrice = new StockPrice().init({
            price: quote.c,
            symbolId: symbolEntity.id
        })
        stockPrice = await this.stockPriceRepository.save(stockPrice);

        return { status: 'successful' };
    }

    private fetchStockQuote(symbol: string): Promise<FinnhubClientResponse<FinnhubStockQuote>> {
        return new Promise((resolve, reject) => {
            this.finnhubClient.quote(symbol, (error, data: FinnhubStockQuote, response) => {
                // If no stock found with this symbol Finnhub will respond with a data object with 0 in all fields
                if(data && data.c === 0) {
                    reject(new Error('Symbol not found'))
                }

                resolve({ data, error, response });
            })
        })
    }

    // CRON job to fetch prices for all of the symbols that have isUpdating true
    // iterate through all of them and fetch new quote and add StockPrice
}
