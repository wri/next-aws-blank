import { MigrationInterface, QueryRunner } from "typeorm";

export class RD22Normalization1770308617097 implements MigrationInterface {
    name = 'RD22Normalization1770308617097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f685d950a3f4144ec3e30f581e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1192f7376d5866e38700f4a4f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc31e662c2b5218387bde63d10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca21ccbaaeadf462078a3aec19"`);
        await queryRunner.query(`CREATE TYPE "public"."answer_value_enum" AS ENUM('yes', 'partly', 'no', 'na')`);
        await queryRunner.query(`CREATE TYPE "public"."assessments_status_enum" AS ENUM('draft', 'in-progress', 'completed', 'archived')`);
        await queryRunner.query(`CREATE TABLE "answer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" "public"."answer_value_enum", "rationale" text, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "assessment_id" uuid NOT NULL, "question_id" uuid NOT NULL, CONSTRAINT "UQ_626f3fbf79785b13f86f6a331e7" UNIQUE ("assessment_id", "question_id"), CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_065fc14c702822bdcbfd0d166f" ON "answer" ("assessment_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c3d19a89541e4f0813f2fe0919" ON "answer" ("question_id") `);
        await queryRunner.query(`CREATE TYPE "public"."question_theme_enum" AS ENUM('Motivate', 'Enable', 'Implement')`);
        await queryRunner.query(`CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_code" character varying NOT NULL, "theme" "public"."question_theme_enum" NOT NULL, "enabling_condition" character varying NOT NULL, "key_success_factor" character varying NOT NULL, "definition" text, "question_text" text NOT NULL, "considerations" text, "follow_up_questions" text, "strategy_examples" text, "sort_order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "diagnostic_id" uuid NOT NULL, CONSTRAINT "UQ_6eeca04c32f08cffb807ef757f9" UNIQUE ("diagnostic_id", "question_code"), CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_febac83bee419e09ef17f34970" ON "question" ("diagnostic_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa6af4ce5fd8c5957910e1faf4" ON "question" ("theme") `);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "questions"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "creation_date"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "creation_date"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "last_update"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "submission_date"`);
        // Add title as nullable first, set defaults for existing records, then make it NOT NULL
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "title" character varying`);
        await queryRunner.query(`UPDATE "diagnostic" SET "title" = CONCAT('Restoration Diagnostic v', "version") WHERE "title" IS NULL`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "submitted_at" TIMESTAMP`);
        // Handle language column similarly
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "language"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "language" character varying`);
        await queryRunner.query(`UPDATE "diagnostic" SET "language" = 'en' WHERE "language" IS NULL`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ALTER COLUMN "language" SET NOT NULL`);
        // Handle diagnostic_year similarly
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "diagnostic_year"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "diagnostic_year" character varying`);
        await queryRunner.query(`UPDATE "assessments" SET "diagnostic_year" = EXTRACT(YEAR FROM CURRENT_DATE)::varchar WHERE "diagnostic_year" IS NULL`);
        await queryRunner.query(`ALTER TABLE "assessments" ALTER COLUMN "diagnostic_year" SET NOT NULL`);
        // Handle status similarly - using enum type
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "status" "public"."assessments_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD CONSTRAINT "UQ_f685d950a3f4144ec3e30f581e6" UNIQUE ("version", "language")`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_065fc14c702822bdcbfd0d166f8" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_febac83bee419e09ef17f349700" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_febac83bee419e09ef17f349700"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_c3d19a89541e4f0813f2fe09194"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_065fc14c702822bdcbfd0d166f8"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP CONSTRAINT "UQ_f685d950a3f4144ec3e30f581e6"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "status" character varying(50) NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "diagnostic_year"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "diagnostic_year" character varying(4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "language"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "language" character varying(2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "submitted_at"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "diagnostic" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "submission_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "last_update" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD "creation_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "creation_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "diagnostic" ADD "questions" text NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa6af4ce5fd8c5957910e1faf4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_febac83bee419e09ef17f34970"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TYPE "public"."question_theme_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3d19a89541e4f0813f2fe0919"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_065fc14c702822bdcbfd0d166f"`);
        await queryRunner.query(`DROP TABLE "answer"`);
        await queryRunner.query(`DROP TYPE "public"."answer_value_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assessments_status_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_ca21ccbaaeadf462078a3aec19" ON "assessments" ("region_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc31e662c2b5218387bde63d10" ON "assessments" ("lead_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1192f7376d5866e38700f4a4f1" ON "assessments" ("diagnostic_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f685d950a3f4144ec3e30f581e" ON "diagnostic" ("language", "version") `);
    }

}
