import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLikeForComments1749107870814 implements MigrationInterface {
  name = 'AddLikeForComments1749107870814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."like_for_comments_like_status_enum" AS ENUM('None', 'Like', 'Dislike')`,
    );
    await queryRunner.query(`CREATE TABLE "like_for_comments"
                             (
                                 "created_at"  TIMESTAMP WITH TIME ZONE                      NOT NULL DEFAULT now(),
                                 "updated_at"  TIMESTAMP WITH TIME ZONE                      NOT NULL DEFAULT now(),
                                 "deleted_at"  TIMESTAMP WITH TIME ZONE,
                                 "id"          SERIAL                                        NOT NULL,
                                 "like_status" "public"."like_for_comments_like_status_enum" NOT NULL DEFAULT 'None',
                                 "user_id"     uuid                                          NOT NULL,
                                 "comment_id"  integer                                       NOT NULL,
                                 CONSTRAINT "PK_671dcec68fda704a79cfabba972" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "like_for_comments"
        ADD CONSTRAINT "FK_e2b2f435e4a5e376586ac30a610" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "like_for_comments"
        ADD CONSTRAINT "FK_02bdc81af869544801f626b3b68" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "like_for_comments"
        DROP CONSTRAINT "FK_02bdc81af869544801f626b3b68"`);
    await queryRunner.query(`ALTER TABLE "like_for_comments"
        DROP CONSTRAINT "FK_e2b2f435e4a5e376586ac30a610"`);
    await queryRunner.query(`DROP TABLE "like_for_comments"`);
    await queryRunner.query(
      `DROP TYPE "public"."like_for_comments_like_status_enum"`,
    );
  }
}
