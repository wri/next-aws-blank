/**
 * Database Query Runner
 * 
 * Executes raw SQL queries against the database via TypeORM connection.
 * Useful for debugging, verification, and quick data inspection.
 * 
 * Usage:
 *   npm run db:query -- "SELECT * FROM question LIMIT 5"
 *   npm run db:query -- "SELECT * FROM question LIMIT 5" --force  (for production)
 * 
 * Safety:
 *   - Prevents execution against production databases by default
 *   - Use --force flag to override (use with extreme caution)
 */

import { AppDataSource } from '../data-source'

/**
 * Check if we're connecting to a production database
 */
function isProductionDatabase(): boolean {
  const dbName = process.env.DB_NAME?.toLowerCase() || ''
  const dbHost = process.env.DB_HOST?.toLowerCase() || ''
  const nodeEnv = process.env.NODE_ENV?.toLowerCase() || ''
  
  return (
    nodeEnv === 'production' ||
    dbName.includes('prod') ||
    dbName === 'production' ||
    dbHost.includes('prod')
  )
}

async function runQuery() {
  const args = process.argv.slice(2)
  const query = args.find(arg => !arg.startsWith('--'))
  const hasForceFlag = args.includes('--force')
  
  if (!query) {
    console.error('❌ Error: No query provided\n')
    console.log('Usage: npm run db:query -- "SELECT * FROM table"\n')
    console.log('Examples:')
    console.log('  npm run db:query -- "SELECT COUNT(*) FROM question"')
    console.log('  npm run db:query -- "SELECT * FROM question LIMIT 5"')
    console.log('  npm run db:query -- "DELETE FROM table WHERE id = 1" --force  (production only)')
    process.exit(1)
  }
  
  // Production database protection
  if (isProductionDatabase() && !hasForceFlag) {
    console.error('🚨 ERROR: Production database detected!\n')
    console.error('Database: ' + (process.env.DB_NAME || 'unknown'))
    console.error('Host: ' + (process.env.DB_HOST || 'unknown'))
    console.error('Environment: ' + (process.env.NODE_ENV || 'unknown'))
    console.error('\nTo run queries against production, use the --force flag:')
    console.error('  npm run db:query -- "YOUR_QUERY" --force\n')
    console.error('⚠️  USE WITH EXTREME CAUTION - PRODUCTION DATA CAN BE PERMANENTLY AFFECTED\n')
    process.exit(1)
  }
  
  if (isProductionDatabase() && hasForceFlag) {
    console.warn('⚠️  WARNING: Running query against PRODUCTION database!')
    console.warn('Database: ' + (process.env.DB_NAME || 'unknown'))
    console.warn('Host: ' + (process.env.DB_HOST || 'unknown'))
    console.warn('')
  }
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      console.log('🔌 Connecting to database...')
      await AppDataSource.initialize()
    }
    
    console.log(`\n🔍 Executing query:\n${query}\n`)
    
    // Execute the query
    const results = await AppDataSource.query(query)
    
    // Display results
    if (!results || results.length === 0) {
      console.log('✓ Query executed successfully. No results returned.\n')
    } else {
      console.log(`✓ Query returned ${results.length} row(s):\n`)
      console.table(results)
      console.log() // Empty line for readability
    }
    
    // Cleanup
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    process.exit(0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('\n❌ Query failed:')
    console.error(error.message)
    
    if (error.detail) {
      console.error('\nDetails:', error.detail)
    }
    
    if (error.hint) {
      console.error('\nHint:', error.hint)
    }
    
    // Attempt cleanup
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy()
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
      void cleanupError;
    }
    
    process.exit(1)
  }
}

runQuery()
