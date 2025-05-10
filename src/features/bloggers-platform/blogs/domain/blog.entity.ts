import { Column, Entity } from 'typeorm';
import { BlogCreateModel } from '../api/models/input/create-blog.input.model';
import { BaseWithNumberIdEntity } from '../../../../core/entities/base-with-number-id.entity';

@Entity()
export class Blog extends BaseWithNumberIdEntity {
  @Column({ type: 'varchar', collation: 'C' })
  public name: string;

  @Column({ type: 'varchar', collation: 'C' })
  public description: string;

  @Column({ type: 'varchar', collation: 'C' })
  public websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  public isMembership: boolean = false;

  static create(dto: BlogCreateModel): Blog {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    return blog;
  }

  update(data: Partial<Blog>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
