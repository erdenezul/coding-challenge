import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserFromToken } from 'src/typedefs';
import { BuyProductDto, BuyProductResponse } from './dto/buy.dto';
import { Coin, DepositCoinDto } from './dto/deposit.dto';

@Injectable()
export class VendingService {
  constructor(private readonly dbService: PrismaService) {}

  async deposit(user: UserFromToken, payload: DepositCoinDto) {
    await this.dbService.user.update({
      where: {
        id: user.id,
      },
      data: {
        deposit: { increment: Number(payload.coin) },
      },
    });
  }

  async buy(
    user: UserFromToken,
    payload: BuyProductDto,
  ): Promise<BuyProductResponse> {
    try {
      const product = await this.dbService.product.findUniqueOrThrow({
        where: { id: payload.productId, available: { lte: payload.amount } },
      });
      const total = product.cost * payload.amount;
      const userDeposit = await this.dbService.user.update({
        where: { id: user.id, deposit: { gte: total } },
        data: {
          deposit: { increment: -total },
        },
      });
      return {
        productId: product.id,
        productName: product.name,
        total,
        changes: this.changes(userDeposit.deposit),
      };
    } catch (error) {
      if (error.code === 'P2025' && error.message.includes('Product')) {
        throw new HttpException(
          'No enough stock or product not found',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      if (error.code === 'P2025' && error.message.includes('User')) {
        throw new HttpException('No enough deposit', HttpStatus.BAD_REQUEST);
      }
    }
  }

  private changes(value: number): Coin[] {
    const coins = [100, 50, 20, 10, 5];
    let changes = [];
    let amount = value;
    coins.forEach((coin) => {
      if (amount >= coin) {
        const coinCount = Math.floor(amount / coin);
        changes = [...changes, Array.from({ length: coinCount }).fill(coin)];
        amount -= coin * coinCount;
      }
    });
    return changes.map(String) as Coin[];
  }

  async reset(user: UserFromToken) {
    await this.dbService.user.update({
      where: { id: user.id },
      data: { deposit: 0 },
    });
  }
}
