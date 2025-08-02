import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusFieldForPlayers1754128918043
  implements MigrationInterface
{
  name = 'AddStatusFieldForPlayers1754128918043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."players_status_enum" AS ENUM('Win', 'Lose', 'Draw')`,
    );
    await queryRunner.query(`ALTER TABLE "players"
      ADD "status" "public"."players_status_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "players"
      DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."players_status_enum"`);
  }
}
