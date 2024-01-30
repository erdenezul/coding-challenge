import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { UserFromToken } from 'src/typedefs';
import { BuyProductDto } from './dto/buy.dto';
import { Coin, DepositCoinDto } from './dto/deposit.dto';
import { VendingController } from './vending.controller';
import { VendingService } from './vending.service';

describe('VendingController', () => {
  let controller: VendingController;

  const serviceMock = {
    deposit: jest.fn(),
    buy: jest.fn(),
    reset: jest.fn(),
  };

  const signedUser: UserFromToken = {
    id: faker.string.uuid(),
  };
  const req = {
    user: signedUser,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendingController],
      providers: [
        {
          provide: VendingService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<VendingController>(VendingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deposit', () => {
    const payload: DepositCoinDto = {
      coin: Coin.Fifty,
    };

    it('should call deposit from service method', async () => {
      await controller.deposit(req, payload);
      expect(serviceMock.deposit).toHaveBeenCalledWith(signedUser, payload);
    });
  });

  describe('buy', () => {
    const payload: BuyProductDto = {
      productId: faker.string.uuid(),
      amount: faker.number.int(),
    };
    it('should call buy from service method', async () => {
      await controller.buy(req, payload);
      expect(serviceMock.buy).toHaveBeenCalledWith(signedUser, payload);
    });
  });

  describe('reset', () => {
    it('should call reset from service method', async () => {
      await controller.reset(req);
      expect(serviceMock.reset).toHaveBeenCalledWith(signedUser);
    });
  });
});
