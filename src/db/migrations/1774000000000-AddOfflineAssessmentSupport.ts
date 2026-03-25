import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOfflineAssessmentSupport1774000000000 implements MigrationInterface {
  name = 'AddOfflineAssessmentSupport1774000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add contact_agreement column to lead table
    await queryRunner.query(
      `ALTER TABLE "lead" ADD "contact_agreement" boolean DEFAULT false`,
    )

    // Check if assessments_status_enum exists, if not, the status column is varchar
    // In that case, we don't need to do anything as varchar can hold any value
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'assessments_status_enum'
    `)

    if (enumExists && enumExists.length > 0) {
      // Add 'offline' value to the assessments_status_enum Postgres type
      await queryRunner.query(
        `ALTER TYPE "public"."assessments_status_enum" ADD VALUE IF NOT EXISTS 'offline'`,
      )
    }
    // If enum doesn't exist, status is varchar and already supports 'offline' value
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove contact_agreement column
    await queryRunner.query(`ALTER TABLE "lead" DROP COLUMN "contact_agreement"`)

    // Check if assessments_status_enum exists
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'assessments_status_enum'
    `)

    if (enumExists && enumExists.length > 0) {
      // Note: Removing a value from a Postgres enum requires recreating the type.
      // This down migration recreates the enum without 'offline' and migrates existing data.
      await queryRunner.query(
        `ALTER TABLE "assessments" ALTER COLUMN "status" TYPE varchar USING status::text`,
      )
      await queryRunner.query(`DROP TYPE "public"."assessments_status_enum"`)
      await queryRunner.query(
        `CREATE TYPE "public"."assessments_status_enum" AS ENUM('draft', 'in-progress', 'completed', 'archived')`,
      )
      await queryRunner.query(
        `ALTER TABLE "assessments" ALTER COLUMN "status" TYPE "public"."assessments_status_enum" USING status::"public"."assessments_status_enum"`,
      )
    }
    // If enum doesn't exist, status is already varchar and down migration is not needed
  }
}
