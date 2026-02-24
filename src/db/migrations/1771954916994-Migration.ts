import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771954916994 implements MigrationInterface {
    name = 'Migration1771954916994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "UQ_626f3fbf79785b13f86f6a331e7"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f"`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "PK_b7406822abfc69dc8f73508c1c2" PRIMARY KEY ("id", "updated_at")`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "PK_b7406822abfc69dc8f73508c1c2"`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "UQ_626f3fbf79785b13f86f6a331e7" UNIQUE ("assessment_id", "question_id")`);
    }

}
