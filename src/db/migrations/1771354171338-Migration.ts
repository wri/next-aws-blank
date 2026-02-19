import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771354171338 implements MigrationInterface {
    name = 'Migration1771354171338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add column as nullable first
        await queryRunner.query(`ALTER TABLE "question" ADD "minimal_key_success_factor" character varying`);
        
        // Set a default value for existing rows (will be updated by seed)
        await queryRunner.query(`UPDATE "question" SET "minimal_key_success_factor" = "key_success_factor" WHERE "minimal_key_success_factor" IS NULL`);
        
        // Now make it NOT NULL
        await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "minimal_key_success_factor" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "minimal_key_success_factor"`);
    }

}
