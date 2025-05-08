import { CreateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  public deletedAt: Date | null;
}
