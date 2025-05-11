// migrations/0002_add_regions.ts
import { Database } from "bun:sqlite";
import { v4 } from "uuid";
// adjust the path to wherever you keep your geo.json
import geoData from "../data/moldova.region.geo.json";

export const up = async (db: Database) => {
  // 1) Create the table if it doesn’t already exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS regions (
      id   TEXT PRIMARY KEY,
      iso  TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // 2) Prepare an INSERT‐OR‐IGNORE so you can rerun safely
  const insert = db.prepare(`
    INSERT OR IGNORE INTO regions (id, iso, name)
    VALUES ($id, $iso, $name);
  `);

  // 3) Walk every feature in your GeoJSON
  for (const feature of geoData.features || []) {
    const props = feature.properties || {};
    const iso  = props.shapeISO;
    const name = props.shapeName;

    // skip anything missing the two fields
    if (!iso || !name) continue;

    insert.run({
      id:   v4(),
      iso,
      name,
    });
  }
};
