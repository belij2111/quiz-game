import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailConfirmations1749105593708 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "email_confirmations"
                             (
                                 "created_at"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "updated_at"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "deleted_at"        TIMESTAMP WITH TIME ZONE,
                                 "id"                uuid                     NOT NULL DEFAULT uuid_generate_v4(),
                                 "confirmation_code" character varying,
                                 "expiration_date"   TIMESTAMP WITH TIME ZONE,
                                 "user_id"           uuid                     NOT NULL,
                                 CONSTRAINT "REL_97c4781eabb13c92ea53f21d8f" UNIQUE ("user_id"),
                                 CONSTRAINT "PK_178b5599cd7e3ec9cfdfb144b50" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "email_confirmations"
        ADD CONSTRAINT "FK_97c4781eabb13c92ea53f21d8f9" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "email_confirmations"
        DROP CONSTRAINT "FK_97c4781eabb13c92ea53f21d8f9"`);
    await queryRunner.query(`DROP TABLE "email_confirmations"`);
  }
}
