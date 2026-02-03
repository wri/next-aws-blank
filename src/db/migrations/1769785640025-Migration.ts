import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769785640025 implements MigrationInterface {
    name = 'Migration1769785640025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lead" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_title" character varying, "name" character varying NOT NULL, "email" character varying NOT NULL, "organization" character varying, "role" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_82927bc307d97fe09c616cd3f58" UNIQUE ("email"), CONSTRAINT "PK_ca96c1888f7dcfccab72b72fffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "region" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "region_name" character varying NOT NULL, "geography_type" character varying NOT NULL, "countries" text, "sub_region" character varying, "scope" character varying, "ecosystems" text NOT NULL, "gis_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5f48ffc3af96bc486f5f3f3a6da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "diagnostic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "questions" text NOT NULL, "version" character varying NOT NULL, "language" character varying(2) NOT NULL, "creation_date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_98c9b0b51c24cd981d15ee3091b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f685d950a3f4144ec3e30f581e" ON "diagnostic" ("version", "language") `);
        await queryRunner.query(`CREATE TYPE "public"."assessments_project_type_enum" AS ENUM('GEF_8', 'WRI', 'other')`);
        await queryRunner.query(`CREATE TABLE "assessments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "diagnostic_id" uuid NOT NULL, "password" text NOT NULL, "creation_date" TIMESTAMP NOT NULL DEFAULT now(), "last_update" TIMESTAMP DEFAULT now(), "submission_date" TIMESTAMP, "diagnostic_year" character varying(4) NOT NULL, "project_type" "public"."assessments_project_type_enum" NOT NULL DEFAULT 'other', "status" character varying(50) NOT NULL DEFAULT 'draft', "lead_id" uuid NOT NULL, "region_id" uuid NOT NULL, CONSTRAINT "PK_a3442bd80a00e9111cefca57f6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1192f7376d5866e38700f4a4f1" ON "assessments" ("diagnostic_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc31e662c2b5218387bde63d10" ON "assessments" ("lead_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca21ccbaaeadf462078a3aec19" ON "assessments" ("region_id") `);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_bc31e662c2b5218387bde63d107" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_ca21ccbaaeadf462078a3aec196" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_1192f7376d5866e38700f4a4f1c" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_1192f7376d5866e38700f4a4f1c"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_ca21ccbaaeadf462078a3aec196"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_bc31e662c2b5218387bde63d107"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca21ccbaaeadf462078a3aec19"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc31e662c2b5218387bde63d10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1192f7376d5866e38700f4a4f1"`);
        await queryRunner.query(`DROP TABLE "assessments"`);
        await queryRunner.query(`DROP TYPE "public"."assessments_project_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f685d950a3f4144ec3e30f581e"`);
        await queryRunner.query(`DROP TABLE "diagnostic"`);
        await queryRunner.query(`DROP TABLE "region"`);
        await queryRunner.query(`DROP TABLE "lead"`);
    }

}
