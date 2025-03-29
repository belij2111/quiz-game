import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../domain/comment.sql.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(comment: Comment): Promise<string> {
    const result = await this.dataSource.query(
      `INSERT INTO "comments"(id, "content", "createdAt", "postId", "userId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        comment.id,
        comment.content,
        comment.createdAt,
        comment.postId,
        comment.userId,
      ],
    );
    return result[0].id;
  }

  async findById(commentId: string): Promise<Comment | null> {
    const result = await this.dataSource.query(
      `SELECT *
       FROM "comments" c
       WHERE c.id = $1`,
      [commentId],
    );
    return result[0];
  }

  async findByIdOrNotFoundFail(commentId: string): Promise<Comment> {
    const foundComment = await this.findById(commentId);
    if (!foundComment) {
      throw new NotFoundException([
        { field: 'foundComment', message: 'Comment not found' },
      ]);
    }
    return foundComment;
  }

  async update(
    foundComment: Comment,
    updateCommentDto: CommentCreateModel,
  ): Promise<boolean | null> {
    const result = await this.dataSource.query(
      `UPDATE "comments" c
       SET "content" = $1
       WHERE c.id = $2`,
      [updateCommentDto.content, foundComment.id],
    );
    return result.rowCount !== 0;
  }

  async delete(commentId: string): Promise<boolean | null> {
    const result = await this.dataSource.query(
      `DELETE
       FROM "comments" c
       WHERE c.id = $1`,
      [commentId],
    );
    return result[1] === 1;
  }
}
