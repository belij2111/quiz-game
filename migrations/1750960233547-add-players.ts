import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayers1750960233547 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "players"
                             (
                                 "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "deleted_at" TIMESTAMP WITH TIME ZONE,
                                 "id"         uuid                     NOT NULL DEFAULT uuid_generate_v4(),
                                 "score"      integer                           DEFAULT '0',
                                 "user_id"    uuid                     NOT NULL,
                                 CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "players"
        ADD CONSTRAINT "FK_ba3575d2fbe71fab7155366235e" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "players"
        DROP CONSTRAINT "FK_ba3575d2fbe71fab7155366235e"`);
    await queryRunner.query(`DROP TABLE "players"`);
  }
}
