import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Match coding challenge')
    .setDescription('Backend coding challenge')
    .setVersion('1.0')
    .addTag('maze')
    .addBearerAuth()
    .addServer(
      'http://match-coding-challenge-lb-565990186.eu-central-1.elb.amazonaws.com/',
      'development',
    )
    .addServer('http://localhost:3000', 'local')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
