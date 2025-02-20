// app.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ExamsModule } from './exams/exams.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { CompileModule } from './compile/compile.module';
import { QuestionsModule } from './questions/questions.module';
import { ContainerPoolService } from './compile/services/container-pool.service';
import { AiModelsModule } from './ai-models/ai-models.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
    }),
    UsersModule,
    ExamsModule,
    AuthModule,
    CompileModule,
    QuestionsModule,
    AiModelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly containerPoolService: ContainerPoolService) {}

  // 在模块初始化时启动容器池
  async onModuleInit() {
    await this.containerPoolService.initialize(); // 初始化容器池并启动容器
  }
}
