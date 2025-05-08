import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseWithUuidIdEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
