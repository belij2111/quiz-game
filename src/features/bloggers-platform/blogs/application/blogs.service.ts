import { Injectable } from '@nestjs/common';
import { BlogsSqlRepository } from '../infrastructure/blogs.sql.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
}
