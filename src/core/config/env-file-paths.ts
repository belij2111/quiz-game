if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV environment is missing');
}

export const envFilePaths = [
  process.env.ENV_FILE_PATH?.trim() || '',
  `src/env/.env.${process.env.NODE_ENV}.local`,
  `src/env/.env.${process.env.NODE_ENV}`,
  'src/env/.env.production',
];
