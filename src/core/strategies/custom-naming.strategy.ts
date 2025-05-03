import { Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class CustomNamingStrategy extends SnakeNamingStrategy {
  public tableName(className: string, customName: string): string {
    return customName ? customName : `${this.toSnakeCase(className)}s`;
  }

  private toSnakeCase(className: string): string {
    const regex = /([a-z])([A-Z])/g;
    return className.replace(regex, '$1_$2').toLowerCase();
  }
}
