import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnswers1750962404623 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."answers_answer_status_enum" AS ENUM('Correct', 'Incorrect')`,
    );
    await queryRunner.query(`CREATE TABLE "answers"
                             (
                                 "created_at"    TIMESTAMP WITH TIME ZONE              NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP WITH TIME ZONE              NOT NULL DEFAULT now(),
                                 "deleted_at"    TIMESTAMP WITH TIME ZONE,
                                 "id"            uuid                                  NOT NULL DEFAULT uuid_generate_v4(),
                                 "answer_status" "public"."answers_answer_status_enum" NOT NULL,
                                 "player_id"     uuid                                  NOT NULL,
                                 "question_id"   uuid                                  NOT NULL,
                                 CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "answers"
        ADD CONSTRAINT "FK_d432f3b8472a4579de8a7e69279" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "answers"
        DROP CONSTRAINT "FK_d432f3b8472a4579de8a7e69279"`);
    await queryRunner.query(`DROP TABLE "answers"`);
    await queryRunner.query(`DROP TYPE "public"."answers_answer_status_enum"`);
  }
}
