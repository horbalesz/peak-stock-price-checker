import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Symbol } from '../entities/symbol.entity';
import { StockPrice } from '../entities/stock-price.entity';

const quoteSpy = jest.fn()
const mockFinnhub = {
  ApiClient: {
    instance: {
      authentications: {
        api_key: {
          apiKey: ''
        }
      }
    }
  },
  DefaultApi: jest.fn().mockImplementation(() => { return {
    quote: quoteSpy
  } }),
}

jest.mock('finnhub', () => mockFinnhub)

import { StockService } from './stock.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('StockService', () => {
  let service: StockService;
  let configService: ConfigService;
  let symbolRepository: any;
  let stockPriceRepository: any;

  beforeEach(async () => {
    symbolRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      findBy: jest.fn()
    }
    stockPriceRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      findBy: jest.fn(),
      createQueryBuilder: () => stockPriceRepository,
      where: () => stockPriceRepository,
      orderBy: () => stockPriceRepository,
      limit: () => stockPriceRepository,
      getMany: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: getRepositoryToken(Symbol),
          useValue: symbolRepository
        },
        {
          provide: getRepositoryToken(StockPrice),
          useValue: stockPriceRepository
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() }
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAverageStockPrice', () => {
    it('should return the requested info about the stock', async () => {
      const testDate = new Date();
      symbolRepository.findOneBy.mockResolvedValue({ id: 1 });
      stockPriceRepository.getMany.mockResolvedValue([
        {
          price: 2,
          timestamp: testDate
        },
        {
          price: 4,
          timestamp: testDate
        }
      ]);

      const result = await service.getAverageStockPrice('TEST');
      expect(result).toEqual({
        symbol: 'TEST',
        currentPrice: 2,
        averagePrice: 3,
        lastUpdated: testDate.getTime()
      });
    });

    it('should throw an error because the symbol is not found', async () => {
      symbolRepository.findOneBy.mockResolvedValue(null);
      try {
        await service.getAverageStockPrice('TEST');
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Symbol not found');
      }
    });
  });

  describe('addSymbol', () => {
    it('should add the requested symbol to the database', async () => {
      const symbol = 'TEST';
      quoteSpy.mockImplementation((symbol, cb) => {
        cb(null, { c: 1 }, {});
      });
      symbolRepository.findOneBy.mockResolvedValue(null);
      symbolRepository.save.mockResolvedValue({
        id: 1,
        name: symbol,
      });
      
      const result = await service.addSymbol(symbol);
      expect(result).toEqual({ status: 'SUCCESSFUL' });
      expect(stockPriceRepository.save).toHaveBeenCalledWith({
        price: 1,
        symbolId: 1
      });
    });

    it('should throw an exception if the symbol is already in the database', async () => {
      const symbol = 'TEST';
      quoteSpy.mockImplementation((symbol, cb) => {
        cb(null, { c: 1 }, {});
      });
      symbolRepository.findOneBy.mockResolvedValue({ id: 1 });
      
      try {
        await service.addSymbol(symbol);
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Symbol already added');
      }
    });

    it('should throw an exception if finnhub does not have info on the symbol', async () => {
      const symbol = 'TEST';
      quoteSpy.mockImplementation((symbol, cb) => {
        cb(null, { c: 0 }, {});
      });
      
      try {
        await service.addSymbol(symbol);
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Symbol not found');
      }
    });

    it('should throw an exception if finnhub has a problem connecting', async () => {
      const symbol = 'TEST';
      quoteSpy.mockImplementation((symbol, cb) => {
        cb({ error: 'error' }, {}, {});
      });
      
      try {
        await service.addSymbol(symbol);
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Error while fetching stock info');
      }
    });
  })
});
