import { Blog } from '../../../domain/blog.entity';

export class BlogViewModel {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blog: Blog): BlogViewModel {
    const model = new BlogViewModel();
    model.id = blog.id;
    model.name = blog.name;
    model.description = blog.description;
    model.websiteUrl = blog.websiteUrl;
    model.createdAt = blog.createdAt;
    model.isMembership = blog.isMembership;
    return model;
  }
}
