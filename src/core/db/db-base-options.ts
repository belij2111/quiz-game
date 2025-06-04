import { DataSourceOptions } from 'typeorm';
import { CustomNamingStrategy } from '../strategies/custom-naming.strategy';
import { config } from 'dotenv';
import { envFilePaths } from '../config/env-file-paths';

config({ path: envFilePaths });

const isDbSynchronized =
  process.env.IS_DB_SYNCHRONIZE === '1' ||
  process.env.IS_DB_SYNCHRONIZE === 'true' ||
  process.env.IS_DB_SYNCHRONIZE === 'enabled';
const isDbLogging =
  process.env.IS_DB_LOGGING === '1' ||
  process.env.IS_DB_LOGGING === 'true' ||
  process.env.IS_DB_LOGGING === 'enabled';

export const dbBaseOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  namingStrategy: new CustomNamingStrategy(),
  synchronize: isDbSynchronized,
  logging: isDbLogging,
};
