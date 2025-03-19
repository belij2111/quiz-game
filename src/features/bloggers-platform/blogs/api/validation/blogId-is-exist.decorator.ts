import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

@ValidatorConstraint({ name: 'BlogIdIsExist', async: true })
@Injectable()
export class BlogIdIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async validate(value: any, args: ValidationArguments) {
    return await this.blogsSqlRepository.blogIdIsExist(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog ID ${validationArguments?.value} already exist`;
  }
}

export function BlogIdIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIdIsExistConstraint,
    });
  };
}
