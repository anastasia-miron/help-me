import type { Database } from "bun:sqlite";

export const up = async (db: Database) => {
  db.exec(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
            id           TEXT    PRIMARY KEY,
            user_id      TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            endpoint     TEXT    NOT NULL UNIQUE,
            subscription JSON    NOT NULL,
            allow_notifications BOOLEAN NOT NULL DEFAULT 1,
            created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
        );
    `);
};
