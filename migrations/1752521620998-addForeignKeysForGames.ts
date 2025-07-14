import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeysForGames1752521620998 implements MigrationInterface {
  name = 'AddForeignKeysForGames1752521620998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games"
        ADD CONSTRAINT "FK_97172d8d632d06a0163fee59336" FOREIGN KEY ("first_player_id") REFERENCES "players" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "games"
        ADD CONSTRAINT "FK_e298dbbae272f96d1c55d389f63" FOREIGN KEY ("second_player_id") REFERENCES "players" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games"
        DROP CONSTRAINT "FK_e298dbbae272f96d1c55d389f63"`);
    await queryRunner.query(`ALTER TABLE "games"
        DROP CONSTRAINT "FK_97172d8d632d06a0163fee59336"`);
  }
}
