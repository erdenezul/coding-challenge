import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
// export type Coins = '5' | '10' | '20' | '50' | 100;
export enum Coin {
  Five = '5',
  Ten = '10',
  Twenty = '20',
  Fifty = '50',
  Hundred = '100',
}
export class DepositCoinDto {
  @ApiProperty({ example: '5' })
  @IsString()
  @IsEnum(Coin)
  coin: Coin;
}
