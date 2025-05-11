import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
  db.exec(`
    ALTER TABLE messages
    ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT 0;
  `);
};

