import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export const STATUS_SUCCESSFUL = 'SUCCESSFUL';
export const STATUS_UNSUCCESSFUL = 'UNSUCCESSFUL';

export class FinnhubResponse {
  req: any;
  header: any;
  status: number;
  text: string;
}

export class FinnhubStockQuote {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export class FinnhubClientResponse<T> {
  data: T;
  error: unknown | null;
  response: FinnhubResponse;
}

export class SymbolDto {
  @ApiProperty({ example: 'aapl' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  @Transform((params: TransformFnParams) => params.value.toLowerCase())
  symbol: string;
}

export class GetAverageStockPricePayload {
  @ApiProperty({ example: 'aapl' })
  symbol: string;

  @ApiProperty({ example: 185.55 })
  currentPrice: number;

  @ApiProperty({ example: 182.01 })
  averagePrice: number;

  @ApiProperty({ example: 1 })
  lastUpdated: number;
}

export class StatusPayload {
  @ApiProperty({ example: STATUS_SUCCESSFUL })
  status: 'SUCCESSFUL' | 'UNSUCCESSFUL'
}