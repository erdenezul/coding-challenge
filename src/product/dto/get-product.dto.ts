import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GetProductResponse {
  @ApiProperty({ example: 'clrz78uty000008jpcpru1k0d' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'snickers' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  amountAvailable: number;
}
