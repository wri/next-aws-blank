import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772841704489 implements MigrationInterface {
    name = 'Migration1772841704489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" ADD "strategies" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "strategies"`);
    }

}
