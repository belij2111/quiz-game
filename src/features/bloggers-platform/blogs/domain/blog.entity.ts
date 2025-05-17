import { Column, Entity, OneToMany } from 'typeorm';
import { BaseWithNumberIdEntity } from '../../../../core/entities/base-with-number-id.entity';
import { Post } from '../../posts/domain/post.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';

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

  @OneToMany(() => Post, (p) => p.blog, { onDelete: 'CASCADE', cascade: true })
  post: Post[];

  static create(dto: CreateBlogDto): Blog {
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
