import * as finnhub from 'finnhub';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Symbol } from '../entities/symbol.entity';
import { StockPrice } from '../entities/stock-price.entity';

import { FinnhubClientResponse, FinnhubStockQuote, GetAverageStockPricePayload, STATUS_SUCCESSFUL, StatusPayload } from './stock.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StockService {
    private readonly finnhubClient;

    constructor(
        @InjectRepository(Symbol)
        private readonly symbolRepository: Repository<Symbol>,
        @InjectRepository(StockPrice)
        private readonly stockPriceRepository: Repository<StockPrice>,
        private readonly configService: ConfigService
    ) {
        const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        api_key.apiKey = this.configService.get('FINNHUB_API_KEY');
        this.finnhubClient = new finnhub.DefaultApi();
    }

    public async getAverageStockPrice(symbol: string): Promise<GetAverageStockPricePayload> {
        const symbolEntity = await this.symbolRepository.findOneBy({
            name: symbol
        });

        if(!symbolEntity) {
            throw new NotFoundException('Symbol not found')
        }

        const lastStockPrices = await this.stockPriceRepository.createQueryBuilder('stockPrice')
            .where('symbol_id = :symbolId', { symbolId: symbolEntity.id })
            .orderBy('stockPrice.timestamp', 'DESC')
            .limit(10)
            .getMany();

        // There is always at least one stock price because we add an initial one  when adding the symbol
        // So there is no need to check for that

        const sum = lastStockPrices.reduce((total, stockPrice) => {
            return total + stockPrice.price
        }, 0)

        return {
            symbol,
            averagePrice: Number((sum / lastStockPrices.length).toFixed(2)),
            currentPrice: lastStockPrices[0].price,
            lastUpdated: lastStockPrices[0].timestamp.getTime()
        }
    }

    public async addSymbol(symbol: string): Promise<StatusPayload> {
        let quote: FinnhubStockQuote
        try {
            const response = await this.fetchStockQuote(symbol);

            quote = response.data;
        } catch (error) {
            console.error('Error happened during fetchStockQuote', error)
            if(error.message === 'Symbol not found') {
                throw new NotFoundException('Symbol not found');
            }

            throw new BadRequestException('Error while fetching stock info')
        }

        let symbolEntity = await this.symbolRepository.findOneBy({ name: symbol });
        if(symbolEntity) {
            throw new BadRequestException('Symbol already added');
        }

        // Create symbol
        symbolEntity = new Symbol();
        symbolEntity.name = symbol;
        symbolEntity = await this.symbolRepository.save(symbolEntity);

        // Create initial stock price
        let stockPrice = new StockPrice().init({
            price: quote.c,
            symbolId: symbolEntity.id
        })
        stockPrice = await this.stockPriceRepository.save(stockPrice);

        return { status: STATUS_SUCCESSFUL };
    }

    private fetchStockQuote(symbol: string): Promise<FinnhubClientResponse<FinnhubStockQuote>> {
        return new Promise((resolve, reject) => {
            this.finnhubClient.quote(symbol, (error, data: FinnhubStockQuote, response) => {
                // If no stock found with this symbol Finnhub will respond with a data object with 0 in all fields
                if(data && data.c === 0) {
                    reject(new Error('Symbol not found'))
                }

                if(error) {
                    reject(error)
                }

                resolve({ data, error, response });
            })
        })
    }

    @Cron('0 * * * * *')
    private async updateStockPrices() {
        const symbols = await this.symbolRepository.findBy({
            isUpdating: true
        });

        const promises = symbols.map(async (symbolEntity) => {
            const { data: quote } = await this.fetchStockQuote(symbolEntity.name);

            return new StockPrice().init({
                price: quote.c,
                symbolId: symbolEntity.id
            })

        })

        const stockPrices = await Promise.all(promises);
        const results = await this.stockPriceRepository.save(stockPrices);

        console.log(`${new Date().toLocaleTimeString()} - Added ${results.length} new prices.`)
    }
}
