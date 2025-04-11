import { Injectable } from '@nestjs/common';
import { BlogsSqlRepository } from '../infrastructure/blogs.sql.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async delete(id: string): Promise<boolean> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(id);
    return this.blogsSqlRepository.delete(foundBlog.id);
  }
}
