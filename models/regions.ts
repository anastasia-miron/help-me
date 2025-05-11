import { v4 } from "uuid";
import { getDatabase } from "../utils/database";

const db = getDatabase();

class Regions {
  public id = v4();
  public name = "";
  public iso = "";

  static findAll() {
    return db.query(`SELECT * FROM regions`).all();
  }

  static findByUserId(userId: string): Regions[] {
    return db
      .query<Regions, { user_id: string }>(
        `SELECT r.*
           FROM regions r
           JOIN user_regions ur
             ON ur.region_id = r.id
          WHERE ur.user_id = $user_id;`
      )
      .as(Regions)
      .all({ user_id: userId });
  }

  /**
   * How many active volunteers are in this region?
   */
  getVolunteerCount(): number {
    const row = db
      .query<{ volunteer_count: number }, { region_id: string }>(
        `
            SELECT volunteer_count
              FROM volunteer_counts_per_region
             WHERE region_id = $region_id;
          `
      )
      .get({ region_id: this.id });
    return row?.volunteer_count ?? 0;
  }
}

export default Regions;
