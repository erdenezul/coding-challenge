import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsPositive, IsString } from 'class-validator';
import { Coin } from './deposit.dto';

export class BuyProductDto {
  @ApiProperty({ example: 'cls0av0kx000108jla9k85s8b' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class BuyProductResponse {
  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  total: number;

  @ApiProperty({ example: 'cls0av0kx000108jla9k85s8b' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Snickers' })
  @IsString()
  productName: string;

  @ApiProperty({ example: ['100', '100', '20'] })
  @IsArray({ each: true })
  changes: Coin[];
}
