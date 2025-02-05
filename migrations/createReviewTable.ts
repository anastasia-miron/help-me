import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            request_id TEXT,
            from_id TEXT,
            to_id TEXT,
            rating INTEGER,
            comment TEXT,
            created_at TEXT
        );
    `);
}

