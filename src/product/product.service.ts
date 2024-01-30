import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserFromToken } from 'src/typedefs';
import {
  CreateProductDto,
  CreateProductResponse,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductResponse } from './dto/get-product.dto';

export class NoProductError extends HttpException {
  constructor(id: string, userId: string) {
    super(
      `No product found for this id: ${id}, ${userId}`,
      HttpStatus.NOT_FOUND,
    );
  }
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly dbService: PrismaService) {}

  /**
   * Creates product in db and return id
   * @precondition untainted
   */
  async create(
    user: UserFromToken,
    payload: CreateProductDto,
  ): Promise<CreateProductResponse> {
    this.logger.log('Creating product', payload);

    const { amountAvailable, productName } = payload;
    const product = await this.dbService.product.create({
      data: {
        available: amountAvailable,
        name: productName,
        cost: payload.cost,
        seller: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return { id: product.id };
  }

  async read(limit: number, page: number): Promise<GetProductResponse[]> {
    const products = await this.dbService.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
    return products.map(
      ({ id, name: productName, available: amountAvailable }) => ({
        id,
        productName,
        amountAvailable,
      }),
    );
  }

  async update(
    user: UserFromToken,
    id: string,
    { productName, amountAvailable }: UpdateProductDto,
  ) {
    try {
      await this.dbService.product.update({
        where: {
          id,
          seller_id: user.id,
        },
        data: {
          ...(productName ? { name: productName } : undefined),
          available: { increment: amountAvailable },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NoProductError(id, user.id);
      }
      throw error;
    }
  }
  async delete(user: UserFromToken, id: string) {
    try {
      await this.dbService.product.delete({
        where: { id, seller_id: user.id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NoProductError(id, user.id);
      }
      throw error;
    }
  }
}
