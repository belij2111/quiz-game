import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogs1749106481940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "blogs"
                             (
                                 "created_at"    TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "deleted_at"    TIMESTAMP WITH TIME ZONE,
                                 "id"            SERIAL                        NOT NULL,
                                 "name"          character varying COLLATE "C" NOT NULL,
                                 "description"   character varying COLLATE "C" NOT NULL,
                                 "website_url"   character varying COLLATE "C" NOT NULL,
                                 "is_membership" boolean                       NOT NULL DEFAULT false,
                                 CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blogs"`);
  }
}
