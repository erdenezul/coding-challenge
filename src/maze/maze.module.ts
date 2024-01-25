import { Module } from '@nestjs/common';
import { MazeService } from './maze.service';
import { PrismaService } from 'nestjs-prisma';
import { MazeController } from './maze.controller';

@Module({
  providers: [MazeService, PrismaService],
  controllers: [MazeController],
})
export class MazeModule {}
