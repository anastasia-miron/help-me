import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            is_verified BOOLEAN DEFAULT false,
            profile_img TEXT,
            status TEXT DEFAULT 'active',
            phone TEXT DEFAULT '',
            type TEXT DEFAULT '',
            created_at TEXT
        );
    `);
}