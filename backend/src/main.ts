import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import dns from 'dns';

async function bootstrap() {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT_NUMBER', 3000);
  const origins = configService
    .get<string>('origins', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
