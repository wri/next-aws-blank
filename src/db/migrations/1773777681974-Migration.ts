import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773777681974 implements MigrationInterface {
    name = 'Migration1773777681974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_lead_email"`);
        await queryRunner.query(`ALTER TABLE "question" ADD "locale" character varying(10) NOT NULL DEFAULT 'en'`);
        // Backfill locale from diagnostic.language for existing questions
        await queryRunner.query(`UPDATE "question" SET "locale" = d."language" FROM "diagnostic" d WHERE "question"."diagnostic_id" = d."id"`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "locale"`);
        await queryRunner.query(`CREATE INDEX "IDX_lead_email" ON "lead" ("email") `);
    }

}
