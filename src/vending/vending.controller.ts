import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/typedefs/role.enum';
import { BuyProductDto, BuyProductResponse } from './dto/buy.dto';
import { DepositCoinDto } from './dto/deposit.dto';
import { VendingService } from './vending.service';

@Controller('vending')
export class VendingController {
  constructor(private readonly service: VendingService) {}

  // swagger
  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Deposit coin for logged user' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have a buyer role',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully deposited a coin',
  })
  // controller decorators
  @Post('deposit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Buyer)
  async deposit(@Request() request, @Body() payload: DepositCoinDto) {
    return this.service.deposit(request.user, payload);
  }

  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Buy product from vending machine' })
  @ApiBody({ type: BuyProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BuyProductResponse,
    description: 'Returns product and changes',
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Not enough stock or product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Not enough deposit',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have a buyer role',
  })
  @Post('buy')
  @Roles(Role.Buyer)
  async buy(
    @Request() request,
    @Body() payload: BuyProductDto,
  ): Promise<BuyProductResponse> {
    return this.service.buy(request.user, payload);
  }

  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Reset deposit back to zero' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have a buyer role',
  })
  @Post('reset')
  @Roles(Role.Buyer)
  async reset(@Request() request) {
    return this.service.reset(request.user);
  }
}
