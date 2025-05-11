import { getDatabase } from "../utils/database";
import { v4 } from "uuid";
import { UserTypeEnum, UserAvailabilityEnum } from "../models/user";
import Review from "./reviews";
import type { RegionsModel } from "../types/type";

const db = getDatabase();

class Profile {
  public id: string = v4();
  public username: string = "";
  public email: string = "";
  public phone: string = "";
  public profileImg: string = "";
  public type: UserTypeEnum = UserTypeEnum.NONE;
  public createdAt: Date = new Date();
  public isVerified: boolean = false;
  public skills: string = "";
  public availability: UserAvailabilityEnum = UserAvailabilityEnum.NONE;
  public needs: string = "";
  public location: string = "";
  public rating: number = 0;
  public regions: RegionsModel[] = [];

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      phone: this.phone,
      profileImg: this.profileImg,
      type: this.type,
      createdAt: this.createdAt,
      isVerified: this.isVerified,
      skills: this.skills,
      availability: this.availability,
      needs: this.needs,
      location: this.location,
      rating: this.rating,
      reviews: Review.getByUserId(this.id),
      regions: this.regions,
    };
  }

  private static loadBase(idOrUsername: { id?: string; username?: string }) {
    // single SQL for both findById & findByUserName
    const where =
      idOrUsername.id != null ? `u.id = $id` : `u.username = $username`;

    return db
      .query<Profile, typeof idOrUsername>(
        `
            SELECT
              u.id,
              u.username,
              u.email,
              u.phone,
              u.is_verified   AS isVerified,
              u.created_at    AS createdAt,
              u.type,
              u.profile_img   AS profileImg,
              v.skills,
              v.availability,
              b.needs,
              b.location,
              COALESCE(AVG(r.rating), 0) AS rating
            FROM users u
            LEFT JOIN reviews     r ON u.id = r.to_id
            LEFT JOIN volunteers  v ON u.id = v.user_id
            LEFT JOIN beneficiaries b ON u.id = b.user_id
            WHERE ${where}
            GROUP BY u.id;
          `
      )
      .as(Profile);
  }

  static findById(id: string) {
    const prof = this.loadBase({ id }).get({ id });
    if (!prof) return null;
console.log('test profile type', prof.type)
    // only load regions for volunteers
    if (prof.type === UserTypeEnum.VOLUNTEER) {
        console.log('test', prof.id)
      prof.regions = db
        .query(
          `
              SELECT rg.id, rg.iso, rg.name
                FROM regions rg
                JOIN user_regions ur
                  ON ur.region_id = rg.id
               WHERE ur.user_id = $user_id;
            `
        )
        .all({ user_id: prof.id }) as RegionsModel[];
    }
    return prof;
  }

  static findByUserName(username: string) {
    const prof = this.loadBase({ username }).get({ username });
    if (!prof) return null;

    if (prof.type === UserTypeEnum.VOLUNTEER) {
      prof.regions = db
        .query(
          `
              SELECT rg.id, rg.iso, rg.name
                FROM regions rg
                JOIN user_regions ur
                  ON ur.region_id = rg.id
               WHERE ur.user_id = $user_id;
            `
        )
        .all({ user_id: prof.id }) as RegionsModel[];
    }
    return prof;
  }
}

export default Profile;
