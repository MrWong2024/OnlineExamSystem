// src/main.ts
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启用 cookie parser（必须）
  app.use(cookieParser());

  // 启用 CORS
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局管道（开启严格模式）
  app.useGlobalPipes(
    // ValidationPipe 只对 Controller 层的方法参数生效，而且只在参数装饰器（@Body、@Param、@Query 等）上才会自动触发。
    new ValidationPipe({
      whitelist: true, // ✅ 自动去除非 DTO 中定义的字段
      forbidNonWhitelisted: true, // ✅ 非法字段将导致请求被拒绝，直接抛出异常
      transform: true, // ✅ 将 payload 自动转换为 DTO 类型（如果启用 class-transformer）
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          if (
            error.property &&
            error.children?.length === 0 &&
            error.constraints
          ) {
            // ✅ 普通校验错误（例如 IsString、IsEmail 等失败）
            return Object.values(error.constraints).join(', ');
          } else if (
            error.property &&
            error.children?.length === 0 &&
            !error.constraints
          ) {
            // ✅ 非白名单属性（forbidNonWhitelisted 触发）
            return `不允许传递非法字段：${error.property}`;
          } else {
            // ✅ 嵌套对象校验失败（可能在 children 中）
            return `参数 ${error.property} 不合法`;
          }
        });

        return new BadRequestException(messages);
      },
    }),
  );

  // 全局异常过滤器
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.setGlobalPrefix('api');

  // 监听端口
  await app.listen(process.env.BACKEND_PORT || 5000);
}
bootstrap();
