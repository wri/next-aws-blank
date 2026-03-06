import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772815127185 implements MigrationInterface {
    name = 'Migration1772815127185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" ALTER COLUMN "preparation_step" SET DEFAULT 'target-geography'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" ALTER COLUMN "preparation_step" SET DEFAULT '1'`);
    }

}
