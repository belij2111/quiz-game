import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllData() {
    await Promise.all([
      this.dataSource.query(
        `TRUNCATE TABLE 
        public."users",
        public."email_confirmations",
        public."security_devices",
        public."blogs",
        public."posts",
        public."comments",
        public."like_for_comments",
        public."like_for_posts"
        RESTART IDENTITY`,
      ),
    ]);
  }
}
