import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, Validate } from 'class-validator';
import { IsMultipleOfFiveConstraint } from '../decorators/isMultipleFive';

export class CreateProductDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 10 })
  amountAvailable;

  @IsString()
  @ApiProperty({ example: 'Snikers' })
  productName: string;

  @IsNumber()
  @IsPositive()
  @Validate(IsMultipleOfFiveConstraint, {
    message: 'cost should be multiple of 5',
  })
  cost: number;
}

export class CreateProductResponse {
  @ApiProperty({ example: 'clrz268mv000008jh75wi23ev' })
  @IsString()
  id: string;
}
