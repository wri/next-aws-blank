import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772722763234 implements MigrationInterface {
    name = 'Migration1772722763234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" ADD "preparation_step" character varying NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "preparation_step"`);
    }

}
