import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771530563523 implements MigrationInterface {
    name = 'Migration1771530563523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" ADD "title" character varying NOT NULL DEFAULT 'Assessment Title'`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "allow_data_sharing" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE INDEX "IDX_fa6c13bd0f1077f9bd02235112" ON "assessments" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fa6c13bd0f1077f9bd02235112"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "allow_data_sharing"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "title"`);
    }

}
