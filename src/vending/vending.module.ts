import { Module } from '@nestjs/common';
import { VendingService } from './vending.service';
import { VendingController } from './vending.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  providers: [VendingService, PrismaService],
  controllers: [VendingController],
})
export class VendingModule {}
