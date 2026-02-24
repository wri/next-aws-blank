import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771628874470 implements MigrationInterface {
    name = 'Migration1771628874470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."answer_status_enum" AS ENUM('not_started', 'in_progress', 'complete')`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "status" "public"."answer_status_enum" NOT NULL DEFAULT 'not_started'`);
        await queryRunner.query(`CREATE INDEX "IDX_773d3069eb177ad52263db41e4" ON "answer" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_773d3069eb177ad52263db41e4"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."answer_status_enum"`);
    }

}
