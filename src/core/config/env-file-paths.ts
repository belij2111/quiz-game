import { join } from 'path';

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV environment is missing');
}

export const envFilePaths = [
  process.env.ENV_FILE_PATH?.trim() || '',
  join(process.cwd(), `src/env/.env.${process.env.NODE_ENV}.local`),
  join(process.cwd(), `src/env/.env.${process.env.NODE_ENV}`),
  join(process.cwd(), `src/env/.env.production`),
];
