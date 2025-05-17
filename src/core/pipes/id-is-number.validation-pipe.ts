import { NotFoundException, PipeTransform } from '@nestjs/common';

export class IdIsNumberValidationPipe implements PipeTransform {
  async transform(value: string) {
    const id = parseInt(value, 10);
    if (isNaN(id)) {
      throw new NotFoundException(`Invalid ID: ${value}`);
    }
    return id;
  }
}
