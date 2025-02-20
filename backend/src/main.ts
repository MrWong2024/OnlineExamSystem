import { ValidationPipe } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局管道
  app.useGlobalPipes(new ValidationPipe());

  // 全局异常过滤器
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // 监听端口
  await app.listen(process.env.BACKEND_PORT || 5000);
}
bootstrap();
