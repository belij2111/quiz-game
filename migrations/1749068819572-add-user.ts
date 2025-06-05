import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1749068819572 implements MigrationInterface {
  name = 'AddUser1749068819572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "users"
                             (
                                 "created_at"               TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "updated_at"               TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "deleted_at"               TIMESTAMP WITH TIME ZONE,
                                 "id"                       uuid                          NOT NULL DEFAULT uuid_generate_v4(),
                                 "login"                    character varying COLLATE "C" NOT NULL,
                                 "password"                 character varying             NOT NULL,
                                 "email"                    character varying COLLATE "C" NOT NULL,
                                 "is_confirmed"             boolean                       NOT NULL DEFAULT false,
                                 "recovery_code"            character varying,
                                 "expiration_recovery_code" TIMESTAMP,
                                 CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"),
                                 CONSTRAINT "UQ_450a05c0c4de5b75ac8d34835b9" UNIQUE ("password"),
                                 CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                                 CONSTRAINT "UQ_b57df66fd57855a247014601562" UNIQUE ("recovery_code"),
                                 CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
