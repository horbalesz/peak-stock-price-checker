import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Symbol } from "./symbol.entity";

interface IStockPriceInit {
  symbolId: number;
  price: number;
}

@Entity('stock_price')
export class StockPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Symbol, (symbol) => symbol.prices)
  @JoinColumn({ name: 'symbol_id' })
  symbol: string;

  @Column({
    name: 'symbol_id',
    type: 'int'
  })
  symbolId: number;

  @Column({ type: 'float' })
  price: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  timestamp: number;

  public init(data: IStockPriceInit): StockPrice {
    this.symbolId = data.symbolId;
    this.price = data.price;
    
    return this;
  }
}
