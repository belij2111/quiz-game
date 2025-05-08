import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseWithNumberIdEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;
}
