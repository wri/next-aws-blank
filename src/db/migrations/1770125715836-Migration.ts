import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770125715836 implements MigrationInterface {
    name = 'Migration1770125715836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_bc31e662c2b5218387bde63d107"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_ca21ccbaaeadf462078a3aec196"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_1192f7376d5866e38700f4a4f1c"`);
        await queryRunner.query(`ALTER TABLE "assessments" RENAME COLUMN "password" TO "password_hash"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_bc31e662c2b5218387bde63d107" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_ca21ccbaaeadf462078a3aec196" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_1192f7376d5866e38700f4a4f1c" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_1192f7376d5866e38700f4a4f1c"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_ca21ccbaaeadf462078a3aec196"`);
        await queryRunner.query(`ALTER TABLE "assessments" DROP CONSTRAINT "FK_bc31e662c2b5218387bde63d107"`);
        await queryRunner.query(`ALTER TABLE "assessments" RENAME COLUMN "password_hash" TO "password"`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_1192f7376d5866e38700f4a4f1c" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_ca21ccbaaeadf462078a3aec196" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assessments" ADD CONSTRAINT "FK_bc31e662c2b5218387bde63d107" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
