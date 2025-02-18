-- SQLite
DELETE FROM migrations WHERE file = '202501041703-createRequestTable.ts';


UPDATE users SET password='6731518943742583166' WHERE username = 'qwert';

UPDATE requests SET title = 'Abra Kadabra';

DROP INDEX idx_reviews_to_id;

CREATE UNIQUE INDEX unique_review ON reviews (to_id, request_id);

DELETE FROM reviews WHERE id = 'f703ff24-89ff-4ac9-ba6f-3f84bc1192a1';

CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            request_id TEXT,
            from_id TEXT,
            to_id TEXT,
            rating INTEGER,
            comment TEXT,
            created_at TEXT
        );