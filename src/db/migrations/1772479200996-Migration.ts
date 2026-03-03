import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772479200996 implements MigrationInterface {
    name = 'Migration1772479200996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" ADD "time_horizon" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "restoration_goals" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "engagement_strategy" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "materials" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "materials"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "engagement_strategy"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "restoration_goals"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "time_horizon"`);
    }

}
