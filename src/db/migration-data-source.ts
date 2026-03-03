import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Lead } from './entities/Lead.entity'
import { Region } from './entities/Region.entity'
import { Diagnostic } from './entities/Diagnostic.entity'
import { Assessment } from './entities/Assessment.entity'
import { Question } from './entities/Question.entity'
import { Answer } from './entities/Answer.entity'

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

// Default export for TypeORM CLI
const MigrationDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [
    Lead,
    Region,
    Diagnostic,
    Assessment,
    Question,
    Answer,
  ],
  migrations: ['src/db/migrations/**/*.ts'],
  subscribers: [],
  ssl: {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
  },
})

export default MigrationDataSource
