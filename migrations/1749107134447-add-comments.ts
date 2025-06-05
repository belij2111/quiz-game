import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComments1749107134447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "comments"
                             (
                                 "created_at" TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "updated_at" TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "deleted_at" TIMESTAMP WITH TIME ZONE,
                                 "id"         SERIAL                        NOT NULL,
                                 "content"    character varying COLLATE "C" NOT NULL,
                                 "post_id"    integer                       NOT NULL,
                                 "user_id"    uuid                          NOT NULL,
                                 CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "comments"
        ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "comments"
        ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comments"
        DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
    await queryRunner.query(`ALTER TABLE "comments"
        DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
