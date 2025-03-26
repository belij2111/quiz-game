import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '../domain/post.sql.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostCreateModel } from '../api/models/input/create-post.input.model';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(newPost: Post): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "posts"(id, "title", "shortDescription", "content", "blogId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        newPost.id,
        newPost.title,
        newPost.shortDescription,
        newPost.content,
        newPost.blogId,
        newPost.createdAt,
      ],
    );
    return result[0].id;
  }

  async update(
    foundPostId: string,
    updatedPostDto: PostCreateModel,
  ): Promise<boolean | null> {
    const result = await this.dataSource.query(
      `UPDATE "posts"
       SET "title"            = $1,
           "shortDescription" = $2,
           "content"          = $3,
           "blogId"           = $4
       WHERE "id" = $5`,
      [
        updatedPostDto.title,
        updatedPostDto.shortDescription,
        updatedPostDto.content,
        updatedPostDto.blogId,
        foundPostId,
      ],
    );
    return result.modifiedCount !== 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
       FROM "posts"
       WHERE "id" = $1`,
      [id],
    );
    return result[1] === 1;
  }

  async findByIdOrNotFoundFail(id: string): Promise<Post> {
    const foundPost = await this.findById(id);
    if (!foundPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return foundPost;
  }

  async findById(id: string): Promise<Post | null> {
    const result = await this.dataSource.query(
      `SELECT *
       FROM "posts"
       WHERE id = $1`,
      [id],
    );
    return result[0];
  }
}
