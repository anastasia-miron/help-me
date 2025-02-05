import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            email TEXT,
            password TEXT,
            is_verified BOOLEAN,
            profile_img TEXT,
            status TEXT,
            phone TEXT,
            type TEXT,
            created_at TEXT
        );
    `);
}