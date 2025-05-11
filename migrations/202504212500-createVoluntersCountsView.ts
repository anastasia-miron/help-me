import { Database } from "bun:sqlite";

export const up = async (db: Database) => {
  db.exec(`
    CREATE VIEW IF NOT EXISTS volunteer_counts_per_region AS
      SELECT
        ur.region_id,
        COUNT(*) AS volunteer_count
      FROM user_regions ur
      JOIN users u
        ON u.id = ur.user_id
       AND u.type   = 'volunteer'
      GROUP BY ur.region_id;
  `);
};
