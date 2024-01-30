import { Test, TestingModule } from '@nestjs/testing';
import { VendingService } from './vending.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HttpException, HttpStatus } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { BuyProductDto } from './dto/buy.dto';
import { Product, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { Coin, DepositCoinDto } from './dto/deposit.dto';

describe('VendingService', () => {
  let service: VendingService;

  const prismaMock = {
    product: {
      findUniqueOrThrow: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };
  const signedUser = {
    id: faker.string.uuid(),
  };

  const product: Product = {
    id: faker.string.uuid(),
    name: faker.string.alpha(),
    available: 10,
    seller_id: faker.string.uuid(),
    cost: 10,
  };
  const user: User = {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
    role: 'Buyer',
    deposit: 100,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendingService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<VendingService>(VendingService);
    prismaMock.product.findUniqueOrThrow.mockResolvedValue(product);
    prismaMock.user.update.mockResolvedValue(user);
  });

  afterEach(() => {
    prismaMock.product.findUniqueOrThrow.mockRestore();
    prismaMock.user.update.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buy product', () => {
    const payload: BuyProductDto = {
      productId: faker.string.uuid(),
      amount: 2,
    };

    describe('unhappy path', () => {
      const noStockError = new HttpException(
        'No enough stock or product not found',
        HttpStatus.NOT_ACCEPTABLE,
      );
      const depositError = new HttpException(
        'No enough deposit',
        HttpStatus.BAD_REQUEST,
      );

      it('should throw not enough stock error', async () => {
        prismaMock.product.findUniqueOrThrow.mockRejectedValue(
          new PrismaClientKnownRequestError('No Product found', {
            code: 'P2025',
            clientVersion: '1.0',
          }),
        );
        await expect(service.buy(signedUser, payload)).rejects.toThrow(
          noStockError,
        );
      });

      it("should throw error when user's deposit is not enough", async () => {
        prismaMock.user.update.mockRejectedValue(
          new PrismaClientKnownRequestError('No User found', {
            code: 'P2025',
            clientVersion: '1.0',
          }),
        );
        await expect(service.buy(signedUser, payload)).rejects.toThrow(
          depositError,
        );
      });
    });

    it("should decrement user's deposit", async () => {
      const result = await service.buy(signedUser, payload);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: signedUser.id,
          deposit: { gte: 20 },
        },
        data: {
          deposit: { increment: -20 },
        },
      });
      expect(result).toStrictEqual({
        productId: product.id,
        productName: product.name,
        total: 20,
        changes: ['100'],
      });
    });
  });

  describe('deposit coin', () => {
    const payload: DepositCoinDto = {
      coin: Coin.Hundred,
    };

    it("should increment user's deposit", async () => {
      await service.deposit(signedUser, payload);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: signedUser.id },
        data: {
          deposit: { increment: 100 },
        },
      });
    });
  });

  describe('reset deposit', () => {
    it('should return update deposit to zero', async () => {
      await service.reset(signedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: signedUser.id },
        data: { deposit: 0 },
      });
    });
  });
});
