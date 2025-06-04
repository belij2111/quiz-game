import { DataSource, DataSourceOptions } from 'typeorm';
import { dbBaseOptions } from './core/db/db-base-options';

const migrationsConfig: DataSourceOptions = {
  ...dbBaseOptions,
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
};

export default new DataSource(migrationsConfig);
