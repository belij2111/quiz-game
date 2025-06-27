import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGames1751006687357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."games_status_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`,
    );
    await queryRunner.query(`CREATE TABLE "games"
                             (
                                 "created_at"         TIMESTAMP WITH TIME ZONE     NOT NULL DEFAULT now(),
                                 "updated_at"         TIMESTAMP WITH TIME ZONE     NOT NULL DEFAULT now(),
                                 "deleted_at"         TIMESTAMP WITH TIME ZONE,
                                 "id"                 uuid                         NOT NULL DEFAULT uuid_generate_v4(),
                                 "status"             "public"."games_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer',
                                 "start_game_date"    TIMESTAMP WITH TIME ZONE,
                                 "finished_game_date" TIMESTAMP WITH TIME ZONE,
                                 "first_player_id"    uuid                         NOT NULL,
                                 "second_player_id"   uuid,
                                 CONSTRAINT "REL_97172d8d632d06a0163fee5933" UNIQUE ("first_player_id"),
                                 CONSTRAINT "REL_e298dbbae272f96d1c55d389f6" UNIQUE ("second_player_id"),
                                 CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games"
        ADD CONSTRAINT "FK_97172d8d632d06a0163fee59336" FOREIGN KEY ("first_player_id") REFERENCES "players" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "games"
        ADD CONSTRAINT "FK_e298dbbae272f96d1c55d389f63" FOREIGN KEY ("second_player_id") REFERENCES "players" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "games"
        DROP CONSTRAINT "FK_e298dbbae272f96d1c55d389f63"`);
    await queryRunner.query(`ALTER TABLE "games"
        DROP CONSTRAINT "FK_97172d8d632d06a0163fee59336"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TYPE "public"."games_status_enum"`);
  }
}
