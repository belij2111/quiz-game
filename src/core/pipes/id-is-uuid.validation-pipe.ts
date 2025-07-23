import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class IdIsUuidValidationPipe implements PipeTransform {
  async transform(value: string) {
    if (!isUUID(value)) {
      throw new BadRequestException('Invalid ID format');
    }
    return value;
  }
}
