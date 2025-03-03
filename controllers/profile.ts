import type { Context } from "hono";
import { getDatabase } from "../utils/database";
import { updateUserQuery, updateVolunteerQuery, updateBeneficiaryQuery } from "../db/queries";
import User, { UserStatusEnum, UserTypeEnum } from "../models/user";
import Profile from "../models/profile";

const db = getDatabase();

export const getProfile = async (c: Context) => {
    const userId = c.get('user').id;
    const profile = Profile.findById(userId)

    if (!profile) {
        return c.json({
            success: false,
            message: "User not found",
        }, 404);
    }

    return c.json({
        success: true,
        data: profile
    });
};

export const getProfileByUserName = async (c: Context) => {
    const profile = Profile.findByUserName(c.req.param('username')!)

    if (!profile) {
        return c.json({
            success: false,
            message: "User not found",
        }, 404);
    }

    return c.json({
        success: true,
        data: profile
    });
};

export const updateProfile = async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();
    const userId = user.id;

    user.username = body.username;
    user.email = body.email;
    user.phone = body.phone;
    user.profile_img = body.profileImg;
    user.update();

    if (user.type === UserTypeEnum.VOLUNTEER) {
        updateVolunteerQuery.run({
            skills: body.skills,
            availability: body.availability,
            id: userId
        });
    }
    if (user.type === UserTypeEnum.BENEFICIARY) {
        updateBeneficiaryQuery.run({
            needs: body.needs,
            location: body.location,
            id: userId
        });
    }
    return c.json({
        success: true,
        data: user.getJwtToken()
    })
};


export const updateProfilePassword = async (c: Context) => {
    const { newPassword } = await c.req.json();
    const user: User = c.get('user');
    user.updatePassword(newPassword);

    return c.json({ success: true, data: "Password changed successfully." });
}

export const deleteProfile = async (c: Context) => {
    const user = c.get('user');
    user.updateStatus(UserStatusEnum.DELETED);
    return c.json({ success: true, data: null });
};
