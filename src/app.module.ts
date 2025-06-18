import { configModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { TestingModule } from './features/testing/testing.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dbBaseOptions } from './core/db/db-base-options';
import { QuizGameModule } from './features/quiz-game/quiz-game.module';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => {
        return {
          ...dbBaseOptions,
          autoLoadEntities: true,
        };
      },
      inject: [],
    }),
    CoreModule,
    UserAccountsModule,
    BloggersPlatformModule,
    NotificationsModule,
    QuizGameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const testingModule: any[] = [];
    if (coreConfig.includeTestingModule) {
      testingModule.push(TestingModule);
    }
    return {
      module: AppModule,
      imports: testingModule,
    };
  }
}
