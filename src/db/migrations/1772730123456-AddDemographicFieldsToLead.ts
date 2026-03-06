import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDemographicFieldsToLead1772730123456 implements MigrationInterface {
    name = 'AddDemographicFieldsToLead1772730123456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" ADD "gender" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "age_range" character varying`);
        await queryRunner.query(`ALTER TABLE "lead" ADD "identity" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "identity"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "age_range"`);
        await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "gender"`);
    }

}
