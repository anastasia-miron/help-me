import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        ALTER TABLE requests ADD COLUMN urgency TEXT DEFAULT 'medium';
    `);
}

