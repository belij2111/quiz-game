import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPosts1749106918119 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "posts"
                             (
                                 "created_at"        TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "updated_at"        TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "deleted_at"        TIMESTAMP WITH TIME ZONE,
                                 "id"                SERIAL                        NOT NULL,
                                 "title"             character varying COLLATE "C" NOT NULL,
                                 "short_description" character varying COLLATE "C" NOT NULL,
                                 "content"           character varying COLLATE "C" NOT NULL,
                                 "blog_id"           integer                       NOT NULL,
                                 CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "posts"
        ADD CONSTRAINT "FK_7689491fe4377a8090576a799a0" FOREIGN KEY ("blog_id") REFERENCES "blogs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts"
        DROP CONSTRAINT "FK_7689491fe4377a8090576a799a0"`);
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
