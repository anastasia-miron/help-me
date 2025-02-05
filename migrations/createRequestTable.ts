import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            beneficiary_id TEXT,
            volunteer_id TEXT,
            description TEXT,
            location TEXT,
            status TEXT,
            created_at TEXT
        );
    `);
}