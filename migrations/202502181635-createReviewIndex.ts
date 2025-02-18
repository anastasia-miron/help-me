import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_to_id ON reviews (to_id, request_id);
    `);
}