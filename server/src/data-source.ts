import { Client } from 'pg';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './models/schema';

config();

export const PostgresConfig = {
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432') || 5432,
  username: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'password',
  database: process.env.POSTGRES_DB ?? 'postgres',
};

const client = new Client({
  connectionString: `postgresql://${PostgresConfig.username}:${
    PostgresConfig.password
  }@${PostgresConfig.host}:${PostgresConfig.port.toString()}/${
    PostgresConfig.database
  }`,
  connectionTimeoutMillis: 5000,
  database: PostgresConfig.database,
  host: PostgresConfig.host,
  keepAlive: true,
  application_name: 'manager-app-api',
  password: PostgresConfig.password,
  port: PostgresConfig.port,
  user: PostgresConfig.username,
  statement_timeout: 5000,
});

const main = async (): Promise<void> => {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL');
    console.error(error);
    process.exit(1);
  }
};

void main();

export const db = drizzle(client, {
  schema,
});
