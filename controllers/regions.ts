import type { Context } from "hono";
import Regions from "../models/regions";
import { getDatabase } from "../utils/database";
const db = getDatabase();

export const getAllRegions = async (c: Context) => {
  const regions = await Regions.findAll();
  return c.json({
    success: true,
    data: regions,
  });
};

export const getRegionStatsByIso = async (c: Context) => {
  const iso = c.req.param("iso")!;

  // 1) find the region row by its ISO
  const region = db
    .query<{ id: string; name: string }, { iso: string }>(
      `SELECT id, name
         FROM regions
        WHERE iso = $iso;`
    )
    .get({ iso });

  if (!region) {
    return c.json({ success: false, message: "Region not found" }, 404);
  }

  // 2) look up its volunteer_count from the view
  const countRow = db
    .query<{ volunteer_count: number }, { region_id: string }>(
      `SELECT volunteer_count
         FROM volunteer_counts_per_region
        WHERE region_id = $region_id;`
    )
    .get({ region_id: region.id });

  const volunteer_count = countRow?.volunteer_count ?? 0;

  // 3) return both the human-readable name and the count
  return c.json({
    success: true,
    data: {
      iso,
      name: region.name,
      volunteer_count,
    },
  });
};
