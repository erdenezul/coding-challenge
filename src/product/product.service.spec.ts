import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { UserFromToken } from 'src/typedefs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NoProductError, ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  const prismaMock = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const signedUser: UserFromToken = {
    id: faker.string.uuid(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaMock.product.create.mockResolvedValue({ id: faker.string.uuid() });
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: faker.string.uuid(),
        name: faker.string.alpha(),
        available: 10,
      },
    ]);
    prismaMock.product.delete.mockResolvedValue(true);
    prismaMock.product.update.mockResolvedValue(true);
  });

  afterEach(() => {
    prismaMock.product.findMany.mockRestore();
    prismaMock.product.create.mockRestore();
    prismaMock.product.delete.mockRestore();
    prismaMock.product.update.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const payload: CreateProductDto = {
      productName: 'snikers',
      amountAvailable: 10,
      cost: 10,
    };

    describe('unhappy path', () => {});

    it('should create product in db', async () => {
      await service.create(signedUser, payload);
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          available: payload.amountAvailable,
          name: payload.productName,
          cost: payload.cost,
          seller: {
            connect: {
              id: signedUser.id,
            },
          },
        },
      });
    });
  });

  describe('read', () => {
    it('should return product response', async () => {
      const resp = await service.read(20, 1);
      expect(resp.length).toBe(1);

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        take: 20,
        skip: 0,
      });
    });
  });

  describe('update', () => {
    const productId = faker.string.uuid();
    const payload: UpdateProductDto = {
      productName: 'snickers',
      amountAvailable: 5,
    };

    describe('unhappy path', () => {
      const noProductError = new NoProductError(productId, signedUser.id);

      it('should only owner update product', async () => {
        prismaMock.product.update.mockRejectedValue(
          new PrismaClientKnownRequestError('No record found', {
            code: 'P2025',
            clientVersion: '1.0',
          }),
        );
        await expect(
          service.update(signedUser, productId, payload),
        ).rejects.toThrow(noProductError);
      });

      it('should not swallow any error', async () => {
        prismaMock.product.update.mockRejectedValue(
          new Error('this error should be not swalloed'),
        );
        await expect(
          service.update(signedUser, productId, payload),
        ).rejects.toThrow();
      });
    });

    it('should increment available and update name for product', async () => {
      await service.update(signedUser, productId, payload);
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId, seller_id: signedUser.id },
        data: {
          name: payload.productName,
          available: { increment: payload.amountAvailable },
        },
      });
    });

    it('should increment available only when no name given', async () => {
      await service.update(signedUser, productId, {
        amountAvailable: payload.amountAvailable,
      });
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId, seller_id: signedUser.id },
        data: {
          available: { increment: payload.amountAvailable },
        },
      });
    });
  });

  describe('delete', () => {
    const productId = faker.string.uuid();

    describe('unhappy path', () => {
      it('should return 404 when product not found', async () => {
        prismaMock.product.delete.mockRejectedValue(
          new PrismaClientKnownRequestError('No record found', {
            code: 'P2025',
            clientVersion: '1.0',
          }),
        );
        await expect(service.delete(signedUser, productId)).rejects.toThrow(
          new NoProductError(productId, signedUser.id),
        );
      });

      it('service should not swallow other errors', async () => {
        prismaMock.product.delete.mockRejectedValue(
          new Error('this error should not be swallowed'),
        );
        await expect(service.delete(signedUser, productId)).rejects.toThrow();
      });
    });

    it('should delete product from db', async () => {
      await service.delete(signedUser, productId);
      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: {
          id: productId,
          seller_id: signedUser.id,
        },
      });
    });
  });
});
