import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS notification (
            id TEXT PRIMARY KEY,
            emiiter_id REFERENCES users (id) ON DELETE CASCADE,
            request_id REFERENCES requests (id) ON DELETE CASCADE,
            recipient_id REFERENCES users (id) ON DELETE CASCADE,
            recipient_role TEXT,
            status TEXT,
            is_read BOOLEAN DEFAULT false,
            timestamp TEXT
        );
    `);
};
