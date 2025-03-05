import { BlogDocument } from '../../../domain/blog.entity';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blog: BlogDocument): BlogViewModel {
    const model = new BlogViewModel();
    model.id = blog.id.toString();
    model.name = blog.name;
    model.description = blog.description;
    model.websiteUrl = blog.websiteUrl;
    model.createdAt = blog.createdAt;
    model.isMembership = blog.isMembership;
    return model;
  }
}
