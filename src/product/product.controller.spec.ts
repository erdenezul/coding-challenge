import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;

  const serviceMock = {
    create: jest.fn(),
    read: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const signedUser = {
    id: faker.string.uuid(),
  };

  const req = { user: signedUser };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crud', () => {
    const payload: CreateProductDto = {
      productName: faker.string.alpha(),
      amountAvailable: faker.number.int(),
      cost: 10,
    };
    const productId = faker.string.uuid();

    it('should call create from service', async () => {
      await controller.create(req, payload);
      expect(serviceMock.create).toHaveBeenCalledWith(signedUser, payload);
    });

    it('should call read from service', async () => {
      await controller.read(20, 1);
      expect(serviceMock.read).toHaveBeenCalledWith(20, 1);
    });

    it('should call update from service', async () => {
      await controller.update(req, productId, payload);
      expect(serviceMock.update).toHaveBeenCalledWith(
        signedUser,
        productId,
        payload,
      );
    });

    it('should call delete from service', async () => {
      await controller.delete(req, productId);
      expect(serviceMock.delete).toHaveBeenCalledWith(signedUser, productId);
    });
  });
});
