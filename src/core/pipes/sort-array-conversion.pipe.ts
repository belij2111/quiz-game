import { PipeTransform } from '@nestjs/common';

export class SortArrayConversionPipe<T extends { sort?: string | string[] }>
  implements PipeTransform<T, T>
{
  transform(value: T): T {
    if (!value || !('sort' in value)) return value;
    const result = new (value.constructor as any)();
    Object.assign(result, value);
    result.sort = Array.isArray(value.sort) ? value.sort : [value.sort];
    return result;
  }
}
