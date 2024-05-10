import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StockController } from './stock/stock.controller';
import { StockModule } from './stock/stock.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    type: 'mysql',
                    host: configService.get('DATABASE_HOST'),
                    port: 3306,
                    username: configService.get('DATABASE_USERNAME'),
                    password: configService.get('DATABASE_PASSWORD'),
                    database: configService.get('DATABASE_NAME'),
                    entities: [
                        __dirname + '/entities/*.entity{.ts,.js}',
                    ],
                    synchronize: true,
                }
            }
        }),
        
        StockModule,
    ],
    controllers: [StockController]
})
export class AppModule { }
