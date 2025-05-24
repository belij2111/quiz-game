import { BlogRawDataDto } from '../../../dto/blog-raw-data.dto';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogRawDataDto): BlogViewModel {
    const model = new BlogViewModel();
    model.id = blog.id.toString();
    model.name = blog.name;
    model.description = blog.description;
    model.websiteUrl = blog.websiteUrl;
    model.createdAt = blog.createdAt.toISOString();
    model.isMembership = blog.isMembership;
    return model;
  }
}
