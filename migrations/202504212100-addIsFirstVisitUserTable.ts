import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
  db.exec(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN NOT NULL DEFAULT 1;
    `);
};
