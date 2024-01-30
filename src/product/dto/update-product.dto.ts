import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'snickers' })
  productName?: string;

  @IsNumber()
  @IsPositive()
  amountAvailable: number;
}
