import { getDatabase } from "../utils/database";
import { v4 } from "uuid";
import { UserTypeEnum, UserAvailabilityEnum } from "../models/user";
import Review from "./reviews";

const db = getDatabase();

class Profile {
    public id: string = v4();
    public username: string = '';
    public email: string = '';
    public phone: string = '';
    public profileImg: string = '';
    public type: UserTypeEnum = UserTypeEnum.NONE;
    public createdAt: Date = new Date();
    public isVerified: boolean = false;
    public skills: string = '';
    public availability: UserAvailabilityEnum = UserAvailabilityEnum.NONE;
    public needs: string = '';
    public location: string = '';
    public rating: number = 0;

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
            reviews: Review.getByUserId(this.id)
        }
    }

    static findById(id: string) {
        return db.query<Profile, { id: string }>(`SELECT 
            u.id, u.username, u.email, u.phone, u.is_verified isVerified, u.created_at createdAt, u.type, u.profile_img as profileImg,
            v.skills, v.availability,
            b.needs, b.location,
            COALESCE(AVG(r.rating), 0) as rating
        FROM users u
        LEFT JOIN reviews r ON u.id = r.to_id
        LEFT JOIN volunteers v ON u.id = v.user_id
        LEFT JOIN beneficiaries b ON u.id = b.user_id
        WHERE u.id = $id
        GROUP BY u.id`
        ).as(Profile).get({ id });
    }

    static findByUserName(username: string) {
        return db.query<Profile, { username: string }>(`SELECT 
            u.id, u.username, u.email, u.phone, u.is_verified isVerified, u.created_at createdAt, u.type, u.profile_img as profileImg,
            v.skills, v.availability,
            b.needs, b.location,
            COALESCE(AVG(r.rating), 0) as rating
        FROM users u
        LEFT JOIN reviews r ON u.id = r.to_id
        LEFT JOIN volunteers v ON u.id = v.user_id
        LEFT JOIN beneficiaries b ON u.id = b.user_id
        WHERE u.username = $username 
        GROUP BY u.id`
        ).as(Profile).get({ username });

    }


}

export default Profile