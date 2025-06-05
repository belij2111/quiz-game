import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityDevices1749106091933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "security_devices"
                             (
                                 "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 "deleted_at"  TIMESTAMP WITH TIME ZONE,
                                 "id"          uuid                     NOT NULL DEFAULT uuid_generate_v4(),
                                 "device_id"   uuid                     NOT NULL,
                                 "ip"          character varying        NOT NULL,
                                 "device_name" character varying        NOT NULL,
                                 "iat_date"    TIMESTAMP WITH TIME ZONE NOT NULL,
                                 "exp_date"    TIMESTAMP WITH TIME ZONE NOT NULL,
                                 "user_id"     uuid                     NOT NULL,
                                 CONSTRAINT "UQ_b71a3a02510d7a9bc8d15df7991" UNIQUE ("device_id"),
                                 CONSTRAINT "PK_1a2707b89afb452a5ca4e6c8883" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "security_devices"
        ADD CONSTRAINT "FK_6143ad1ef6f122d933239d3b050" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "security_devices"
        DROP CONSTRAINT "FK_6143ad1ef6f122d933239d3b050"`);
    await queryRunner.query(`DROP TABLE "security_devices"`);
  }
}
