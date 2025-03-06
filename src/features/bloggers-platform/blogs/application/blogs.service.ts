import { Injectable } from '@nestjs/common';
import { BlogCreateModel } from '../api/models/input/create-blog.input.model';
import { Blog } from '../domain/blog.entity';
import { BlogsSqlRepository } from '../infrastructure/blogs.sql.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async create(blogCreateModel: BlogCreateModel): Promise<string> {
    const newBlogDto: Blog = {
      name: blogCreateModel.name,
      description: blogCreateModel.description,
      websiteUrl: blogCreateModel.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
    return await this.blogsSqlRepository.create(newBlogDto);
  }

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
