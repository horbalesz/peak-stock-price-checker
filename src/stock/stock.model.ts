import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

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
  @IsNotEmpty()
  @IsString()
  @Transform((params: TransformFnParams) => params.value.toLowerCase())
  symbol: string;
} 