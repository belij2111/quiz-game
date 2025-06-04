import { envFilePaths } from './core/config/env-file-paths';
import { ConfigModule } from '@nestjs/config';

export const configModule = ConfigModule.forRoot({
  envFilePath: envFilePaths,
  isGlobal: true,
});
