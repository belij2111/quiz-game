import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLikeForPosts1749107374156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "like_for_posts"
                             (
                                 "created_at"  TIMESTAMP WITH TIME ZONE                   NOT NULL DEFAULT now(),
                                 "updated_at"  TIMESTAMP WITH TIME ZONE                   NOT NULL DEFAULT now(),
                                 "deleted_at"  TIMESTAMP WITH TIME ZONE,
                                 "id"          SERIAL                                     NOT NULL,
                                 "like_status" "public"."like_for_posts_like_status_enum" NOT NULL DEFAULT 'None',
                                 "user_id"     uuid                                       NOT NULL,
                                 "post_id"     integer                                    NOT NULL,
                                 CONSTRAINT "PK_ff8119f01371028cc321f5caec6" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "like_for_posts"
        ADD CONSTRAINT "FK_5f7fb4564ad213056ba38623c67" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "like_for_posts"
        ADD CONSTRAINT "FK_abf3b07e977f478190f7222434c" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "like_for_posts"
        DROP CONSTRAINT "FK_abf3b07e977f478190f7222434c"`);
    await queryRunner.query(`ALTER TABLE "like_for_posts"
        DROP CONSTRAINT "FK_5f7fb4564ad213056ba38623c67"`);
    await queryRunner.query(`DROP TABLE "like_for_posts"`);
  }
}
