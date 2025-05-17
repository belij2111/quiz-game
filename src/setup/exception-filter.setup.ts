import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from '../core/exeption-filters/http.exeption-filter';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
}
