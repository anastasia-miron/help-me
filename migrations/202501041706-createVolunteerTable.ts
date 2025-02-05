import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS volunteers (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            skills TEXT,
            availability TEXT
        );
    `);
}