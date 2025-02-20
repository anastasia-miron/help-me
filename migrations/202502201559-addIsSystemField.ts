import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        ALTER TABLE messages
        ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT 0;
    `)
}