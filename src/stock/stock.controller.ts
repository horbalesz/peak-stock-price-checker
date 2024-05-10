import { Controller } from '@nestjs/common';
import { Get, Put } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { StockService } from './stock.service';
import { SymbolDto } from './stock.model';

@Controller('stock')
export class StockController {
    constructor(
        private readonly stockService: StockService
    ) {}

    @Get('/:symbol')
    public getStockPrice(@Param() symbolDto: SymbolDto) {
        return this.stockService.getStockPrice(symbolDto.symbol);
    }

    @Put('/:symbol')
    public addSymbol(@Param() symbolDto: SymbolDto) {
        return this.stockService.addSymbol(symbolDto.symbol);
    }
}
