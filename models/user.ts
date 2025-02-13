import { v4 } from "uuid";
import { getDatabase } from "../utils/database";
import { JWT_SECRET } from "../constants";
import jwt from "jsonwebtoken"

const db = getDatabase();


export enum UserStatusEnum {
    ACTIVE = "active",
    INACTIVE = "inactive",
    BANNED = "banned",
    DELETED = "deleted"
}
export enum UserTypeEnum {
    NONE = '',
    BENEFICIARY = "beneficiary",
    VOLUNTEER = "volunteer"
}

class User {
    public id: string = v4();
    public username: string = '';
    public email: string = '';
    private _password: string = '';
    public is_verified: boolean = false;
    public profile_img: string = '';
    public status: UserStatusEnum = UserStatusEnum.ACTIVE;
    public phone: string = '';
    public type: UserTypeEnum = UserTypeEnum.NONE;
    public created_at: Date = new Date();

    set password(password: string) {
        this._password = Bun.hash(password).toString();
    }

    get password() {
        return this.password;
    }

    checkPassword(password: string) {
        return this.password === Bun.hash(password).toString();
    }

    getJwtToken() {
        return jwt.sign({
            user: {
                id: this.id,
                email: this.email,
                type: this.type,
                username: this.username,
                phone: this.phone,
                profileImg: this.profile_img,
                isVerified: this.is_verified,
                createdAt: this.created_at
            }
        }, JWT_SECRET, {
            expiresIn: "1d",
            issuer: "localhost",
            audience: "localhost"
        });
    }


    create() {
        db.query(`INSERT INTO users (id, email, password, username, phone, is_verified, status, created_at) 
                  VALUES ($id, $email, $password, $username, $phone, $is_verified, $status, $created_at)`)
            .run({
                "id": this.id,
                "is_verified": false,
                "email": this.email,
                "password": this._password,
                "username": this.username,
                "phone": this.phone,
                "status": this.status,
                "created_at": this.created_at.toISOString()
            });
    }



    update() {
        db.query(`UPDATE users SET type=$type, status=$status, is_verified=$is_verified, profile_img=$profile_img, phone=$phone WHERE id = $id`)
            .run({
                "id": this.id,
                "type": this.type,
                "status": this.status,
                "is_verified": this.is_verified,
                "profile_img": this.profile_img,
                "phone": this.phone
            });
    }

    static getByEmail(email: string) {
        return db.query<User, { email: string }>(`SELECT * FROM users WHERE email = $email`).as(User).get({ email });
    }
}

export default User;