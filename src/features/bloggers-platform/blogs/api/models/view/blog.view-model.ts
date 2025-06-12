import { BlogRawDataDto } from '../../../dto/blog-raw-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BlogViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;

  @ApiProperty({ format: 'date-time', required: false })
  createdAt: string;

  @ApiProperty({
    description: 'True if user has not expired membership subscription to blog',
    required: false,
  })
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
