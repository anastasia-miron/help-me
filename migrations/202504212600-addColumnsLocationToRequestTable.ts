import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
  db.exec(`
    ALTER TABLE requests ADD COLUMN location_address TEXT DEFAULT '';
    ALTER TABLE requests ADD COLUMN location_lat     REAL DEFAULT 0;
    ALTER TABLE requests ADD COLUMN location_lng     REAL DEFAULT 0;
  `);
};
