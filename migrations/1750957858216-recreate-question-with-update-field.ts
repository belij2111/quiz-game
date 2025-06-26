import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateQuestionWithUpdateField1750957858216
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "questions"
                             (
                                 "created_at"      TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "updated_at"      TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
                                 "deleted_at"      TIMESTAMP WITH TIME ZONE,
                                 "id"              uuid                          NOT NULL DEFAULT uuid_generate_v4(),
                                 "body"            character varying COLLATE "C" NOT NULL,
                                 "correct_answers" jsonb                         NOT NULL,
                                 "published"       boolean                       NOT NULL DEFAULT false,
                                 CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "questions"`);
  }
}
