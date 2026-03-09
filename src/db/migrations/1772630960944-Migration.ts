import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772630960944 implements MigrationInterface {
    name = 'Migration1772630960944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contributor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "assessment_id" uuid NOT NULL, CONSTRAINT "UQ_2e1ea0fb82d779bf82b6808ff94" UNIQUE ("assessment_id", "name"), CONSTRAINT "PK_816afef005b8100becacdeb6e58" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_41b3b780fedd5010883329c31a" ON "contributor" ("assessment_id") `);
        await queryRunner.query(`CREATE TABLE "answer_contributor" ("contributor_id" uuid NOT NULL, "answer_id" uuid NOT NULL, CONSTRAINT "PK_082758333b7e95c0cbfe7f9a303" PRIMARY KEY ("contributor_id", "answer_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_579b29825c55bf9ab53cc352fd" ON "answer_contributor" ("answer_id") `);
        await queryRunner.query(`ALTER TABLE "contributor" ADD CONSTRAINT "FK_41b3b780fedd5010883329c31a1" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_contributor" ADD CONSTRAINT "FK_0febe48a5c64a83d1e450ed9437" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer_contributor" DROP CONSTRAINT "FK_0febe48a5c64a83d1e450ed9437"`);
        await queryRunner.query(`ALTER TABLE "contributor" DROP CONSTRAINT "FK_41b3b780fedd5010883329c31a1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_579b29825c55bf9ab53cc352fd"`);
        await queryRunner.query(`DROP TABLE "answer_contributor"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41b3b780fedd5010883329c31a"`);
        await queryRunner.query(`DROP TABLE "contributor"`);
    }

}
