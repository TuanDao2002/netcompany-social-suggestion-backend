import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { CommonConstant } from './common/constant';
import { ValidationPipe } from '@nestjs/common';
import { SearchDistance } from './common/search-distance.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors({
    credentials: true,
    origin: [configService.get('APP_BASE_URL'), 'http://localhost:5173'],
  });

  SearchDistance.MIN_DISTANCE = configService.get('MIN_DISTANCE');
  SearchDistance.MAX_DISTANCE = configService.get('MAX_DISTANCE');

  await app.listen(CommonConstant.PORT);
  console.log(`Server listening on port: ${CommonConstant.PORT}`);
}
bootstrap();
