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
        public."securityDevices",
        public."blogs",
        public."posts",
        public."likesForPosts",
        public."comments"
        public."likesForComments"
         RESTART IDENTITY`,
      ),
    ]);
  }
}
