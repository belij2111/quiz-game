import { Injectable } from '@nestjs/common';
import { BlogCreateModel } from '../api/models/input/create-blog.input.model';
import { BlogsSqlRepository } from '../infrastructure/blogs.sql.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async update(
    id: string,
    blogUpdateModel: BlogCreateModel,
  ): Promise<boolean | null> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(id);
    const updatedBlogDto: BlogCreateModel = {
      name: blogUpdateModel.name,
      description: blogUpdateModel.description,
      websiteUrl: blogUpdateModel.websiteUrl,
    };
    return await this.blogsSqlRepository.update(foundBlog, updatedBlogDto);
  }

  async delete(id: string): Promise<boolean> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(id);
    return this.blogsSqlRepository.delete(foundBlog.id);
  }
}
