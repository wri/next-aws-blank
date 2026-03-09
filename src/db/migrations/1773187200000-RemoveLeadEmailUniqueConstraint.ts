import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveLeadEmailUniqueConstraint1773187200000
  implements MigrationInterface
{
  name = 'RemoveLeadEmailUniqueConstraint1773187200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint on lead.email
    // This allows multiple Lead records with the same email but different org/role
    // Try both possible constraint names (depends on when the DB was created)
    await queryRunner.query(`
      ALTER TABLE "lead" DROP CONSTRAINT IF EXISTS "UQ_82927bc307d97fe09c616cd3f58"
    `)
    await queryRunner.query(`
      ALTER TABLE "lead" DROP CONSTRAINT IF EXISTS "UQ_a3cd1b43c5785b8e0a8307b17f9"
    `)
    
    // Also try dropping by index name (PostgreSQL sometimes uses different naming)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_82927bc307d97fe09c616cd3f58"
    `)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_a3cd1b43c5785b8e0a8307b17f9"
    `)
    
    // Drop any unique index on email column
    await queryRunner.query(`
      DROP INDEX IF EXISTS "lead_email_key"
    `)
    
    // Create a non-unique index on email for query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_lead_email" ON "lead" ("email")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the non-unique index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_lead_email"
    `)
    
    // Restore unique constraint (note: this will fail if duplicate emails exist)
    await queryRunner.query(`
      ALTER TABLE "lead" ADD CONSTRAINT "UQ_a3cd1b43c5785b8e0a8307b17f9" UNIQUE ("email")
    `)
  }
}
