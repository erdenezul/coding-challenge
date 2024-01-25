import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import config from './config';
import { MazeModule } from './maze/maze.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
    PrismaModule.forRoot({
      prismaServiceOptions: {
        prismaOptions: {
          log: [{ emit: 'event', level: 'query' }],
        },
      },
    }),
    AuthModule,
    UserModule,
    MazeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
