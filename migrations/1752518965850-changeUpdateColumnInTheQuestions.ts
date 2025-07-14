import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUpdateColumnInTheQuestions1752518965850
  implements MigrationInterface
{
  name = 'ChangeUpdateColumnInTheQuestions1752518965850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "questions"
        ALTER COLUMN "updated_at" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "questions"
        ALTER COLUMN "updated_at" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "questions"
        ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "questions"
        ALTER COLUMN "updated_at" SET NOT NULL`);
  }
}
