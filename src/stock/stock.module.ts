import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StockService } from './stock.service';

import { Symbol } from '../entities/symbol.entity';
import { StockPrice } from '../entities/stock-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Symbol,
      StockPrice
    ])
  ],
  providers: [StockService],
  exports: [StockService]
})
export class StockModule {}
