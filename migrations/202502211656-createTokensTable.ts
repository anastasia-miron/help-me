import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            token TEXT NOT NULL,
            created_at TEXT,
            status TEXT DEFAULT 'active',
            type TEXT
        );
    `);
};
