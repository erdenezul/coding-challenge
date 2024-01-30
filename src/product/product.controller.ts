import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/typedefs/role.enum';
import { ParseCuidPipe } from '../validation/index.pipe';
import {
  CreateProductDto,
  CreateProductResponse,
} from './dto/create-product.dto';
import { GetProductResponse } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  //#region  create
  // swagger's properties
  @ApiTags('product')
  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Creates product' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Product cost should be multiple of 5 or amount should be positive',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns id of a created product',
    type: CreateProductResponse,
  })
  // controllers
  @Roles(Role.Seller)
  @Post()
  /**
   * @untainted
   */
  async create(
    @Request() request,
    @Body() payload: CreateProductDto,
  ): Promise<CreateProductResponse> {
    return this.service.create(request.user, payload);
  }
  //#endregion

  //#region read
  @ApiTags('product')
  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Retrieves product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns product detail',
    type: Array<GetProductResponse>,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Parameter to limit results. By default: 20',
    type: Number,
    allowEmptyValue: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Parammeter to skip results. By default: 1',
    type: Number,
    allowEmptyValue: true,
  })
  @Public()
  @Get()
  async read(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<GetProductResponse[]> {
    return this.service.read(limit, page);
  }
  //#endregion

  //#region update
  // swagger's properties
  @ApiTags('product')
  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Updates product' })
  @ApiParam({ name: 'id', example: 'clrz5hmcl000008kz4asx4u1f' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Succesfully updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or the owner is different',
  })
  // controller's properties
  @Roles(Role.Seller)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Request() request,
    @Param('id', ParseCuidPipe) id: string,
    @Body() payload: UpdateProductDto,
  ) {
    return this.service.update(request.user, id, payload);
  }
  //#endregion

  //#region delete
  // swagger's properties
  @ApiTags('product')
  @ApiTags('vending machine')
  @ApiOperation({ summary: 'Deletes product' })
  @ApiParam({ name: 'id', example: 'clrz5hmcl000008kz4asx4u1f' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Succesfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or the owner is different',
  })
  // controllers
  @Roles(Role.Seller)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() request, @Param('id', ParseCuidPipe) id: string) {
    await this.service.delete(request.user, id);
  }
  //#endregion
}
