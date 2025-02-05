import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            beneficiary_id TEXT,
            volunteer_id TEXT ALLOW NULL,
            description TEXT,
            location TEXT,
            status TEXT DEFAULT 'open',
            created_at TEXT
        );
    `);
}