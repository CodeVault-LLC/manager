import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/database/models/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  migrations: {
    table: 'journal',
    schema: 'migrations'
  }
} satisfies Config
