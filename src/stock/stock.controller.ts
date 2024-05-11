import { Controller } from '@nestjs/common';
import { Get, Put } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { StockService } from './stock.service';
import { GetAverageStockPricePayload, StatusPayload, SymbolDto } from './stock.model';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('stock')
export class StockController {
    constructor(
        private readonly stockService: StockService
    ) {}

    @Get('/:symbol')
    @ApiParam({
        name: 'symbol',
        description: 'Ticker symbol of a stock',
        required: true
    })
    @ApiOkResponse({
        description: 'Returns stored information about the requested stock',
        type: GetAverageStockPricePayload
    })
    @ApiNotFoundResponse({
        description: 'The requested symbol is invalid'
    })
    public getAverageStockPrice(@Param() symbolDto: SymbolDto): Promise<GetAverageStockPricePayload> {
        return this.stockService.getAverageStockPrice(symbolDto.symbol);
    }

    @Put('/:symbol')
    @ApiParam({
        name: 'symbol',
        description: 'Ticker symbol of a stock',
        required: true
    })
    @ApiOkResponse({
        description: 'Adds symbol to a list to update prices for.',
        type: StatusPayload
    })
    @ApiNotFoundResponse({
        description: 'The requested symbol is invalid.'
    })
    @ApiBadRequestResponse({
        description: 'Either something unknown went wrong with getting to Finnhub or the symbol is already added and getting updated.'
    })
    public addSymbol(@Param() symbolDto: SymbolDto): Promise<StatusPayload> {
        return this.stockService.addSymbol(symbolDto.symbol);
    }
}
