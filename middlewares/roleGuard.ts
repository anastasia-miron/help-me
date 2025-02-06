import type { Context, Next } from "hono";
import { UserTypeEnum } from "../models/user";

export const beneficiaryGuard = async (c: Context, next: Next) => {
    const user  = c.get('user');
    if (!user || user.type !== UserTypeEnum.BENEFICIARY) {
        return c.json({success: false, message: 'Unauthorized'});
    }
    return next();
}

export const volunteerGuard = async (c: Context, next: Next) => {
    const user  = c.get('user');
    if (!user || user.type !== UserTypeEnum.VOLUNTEER) {
        return c.json({success: false, message: 'Unauthorized'});
    }
    return next();
}