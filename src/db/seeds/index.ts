import { AppDataSource } from '../data-source';
import { Diagnostic } from '../entities';
import { initialDiagnosticSeed } from './001-initial-diagnostic.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('🔄 Running database seeds...');

    const diagnosticRepo = AppDataSource.getRepository(Diagnostic);

    // Check if seed already exists
    const exists = await diagnosticRepo.findOne({
      where: { version: 'v1.0.0', language: 'en' }
    });

    if (!exists) {
      await diagnosticRepo.save(initialDiagnosticSeed);
      console.log('✅ Initial diagnostic seed data inserted (v1.0.0, English, 24 questions)');
    } else {
      console.log('⚠️  Seed data already exists - skipping');
    }

    console.log('✅ Seeding completed');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    // Ensure data source is destroyed in both success and error paths
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

runSeeds()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));