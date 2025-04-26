import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  public createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  public deletedAt: Date | null;
}
