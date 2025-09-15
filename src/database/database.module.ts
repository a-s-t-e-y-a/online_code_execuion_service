import { Module, Global } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema, type Schema } from '../schema';

const createDatabaseConnection = (): NodePgDatabase<Schema> => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database',
    connectionTimeoutMillis: 5000, 
    idleTimeoutMillis: 30000,
    max: 10,
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  return drizzle(pool, { schema });
};

export const db = createDatabaseConnection();

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useValue: db,
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
