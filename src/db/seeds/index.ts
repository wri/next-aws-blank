import { AppDataSource } from '../data-source';
import { seedDiagnosticWithQuestions } from './002-diagnostic-questions.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('🔄 Running database seeds...');

    // Seed Diagnostic v1.0.0 with 31 questions and sample guidance
    await seedDiagnosticWithQuestions();

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