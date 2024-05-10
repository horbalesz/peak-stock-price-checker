import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StockPrice } from "./stock-price.entity";

@Entity()
export class Symbol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 6 })
  symbol: string;

  @Column({ type: 'bool', default: true })
  isUpdating: boolean;

  @OneToMany(() => StockPrice, (stockPrice) => stockPrice.symbol)
  prices: StockPrice[];
}