import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;
  @CreateDateColumn()
  public createdAt: Date;
  @DeleteDateColumn()
  public deletedAt: Date;
}
