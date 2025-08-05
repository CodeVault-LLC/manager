import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./models/schema";
import { and, desc, eq, lt, or, sql, SQL } from "drizzle-orm";

interface DataServiceProps {
  /**
   * Location of the storage file
   */
  storage_file: string;

  /**
   * Location of the migrations folder
   */
  migrations_folder: string;
}

export class DataService {
  private static instance: DataService;
  private isLoading: boolean;

  private storageFile: string;
  private migrationsFolder: string;

  private db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(props: DataServiceProps) {
    if (DataService.instance) {
      throw new Error(
        "DataService is a singleton and cannot be instantiated multiple times."
      );
    }

    this.storageFile = props.storage_file;
    this.migrationsFolder = props.migrations_folder;

    const client = createClient({ url: `file:${this.storageFile}` });
    this.db = drizzle(client, { schema });

    DataService.instance = this;
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      throw new Error("DataService is not initialized");
    }
    return DataService.instance;
  }

  async runMigrations() {
    this.isLoading = true;

    await migrate(this.db, {
      migrationsFolder: this.migrationsFolder,
    });

    this.isLoading = false;
  }

  isLoadingData(): boolean {
    return this.isLoading;
  }

  getDatabase() {
    return this.db;
  }

  getDatabaseSQL() {
    return {
      eq: eq,
      sql: sql,
      and: and,
      desc: desc,
      or: or,
      SQL: SQL,
      lt: lt,
    };
  }
}
