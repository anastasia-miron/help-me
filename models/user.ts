import { randomUUIDv7 } from "bun";

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
    public id: string = randomUUIDv7();
    public username: string = '';
    public email: string = '';
    public password: string = '';
    public is_verified: boolean = false;
    public profile_img: string = '';
    public status: UserStatusEnum = UserStatusEnum.ACTIVE;
    public phone: string = '';
    public type: UserTypeEnum = UserTypeEnum.NONE;
    public created_at: Date = new Date();
}

export default User;