
import { Database } from "bun:sqlite";
import { join } from "node:path";

let db: Database | null = null;
export const getDatabase = (): Database => {
    if (db) return db;
    db = new Database(join(__dirname, `../database.db`), { create: true, strict: true });
    db.exec(`CREATE TABLE IF NOT EXISTS "migrations" (
    "file" TEXT UNIQUE PRIMARY KEY, 
    "applied" TEXT
)`);
    return db;
}