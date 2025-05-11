import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
  // 1) Create the join table
  db.exec(`
      CREATE TABLE IF NOT EXISTS user_regions (
        user_id   TEXT    NOT NULL
          REFERENCES users(id)    ON DELETE CASCADE,
        region_id TEXT    NOT NULL
          REFERENCES regions(id)  ON DELETE CASCADE,
        PRIMARY KEY (user_id, region_id)
      );
    `);
};
