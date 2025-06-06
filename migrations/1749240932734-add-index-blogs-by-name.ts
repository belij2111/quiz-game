import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexBlogsByName1749240932734 implements MigrationInterface {
  name = 'AddIndexBlogsByName1749240932734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_f5a86465d43c2db24ea46f0644" ON "blogs" ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f5a86465d43c2db24ea46f0644"`,
    );
  }
}
