import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseWithNumberIdEntity } from '../../../../core/entities/base-with-number-id.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { CreatePostDto } from '../dto/create-post.dto';

@Entity()
export class Post extends BaseWithNumberIdEntity {
  @Column({ type: 'varchar', collation: 'C' })
  title: string;

  @Column({ type: 'varchar', collation: 'C' })
  shortDescription: string;

  @Column({ type: 'varchar', collation: 'C' })
  content: string;

  @ManyToOne(() => Blog, (b) => b.post)
  @JoinColumn()
  public blog: Blog;
  @Column({ type: 'integer' })
  public blogId: number;

  static create(dto: CreatePostDto, blogId: number): Post {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = blogId;
    return post;
  }

  update(data: Partial<Post>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
