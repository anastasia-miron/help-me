import type { Context } from "hono";
import { getDatabase } from "../utils/database";
import { updateUserQuery, updateVolunteerQuery, updateBeneficiaryQuery } from "../db/queries";
import { UserTypeEnum } from "../models/user";

const db = getDatabase();

export const getProfile = async (c: Context) => {
    const userId = c.get('user').id;
    const user = db.query(`
        SELECT 
            u.id, u.username, u.email, u.phone, u.is_verified, u.created_at, u.type, u.profile_img,
            v.skills, v.availability,
            b.needs, b.location
        FROM users u
        LEFT JOIN volunteers v ON u.id = v.user_id
        LEFT JOIN beneficiaries b ON u.id = b.user_id
        WHERE u.id = ?
    `).get(userId);

    if (!user) {
        return c.json({
            success: false,
            message: "User not found",
        }, 404);
    }

    return c.json({
        success: true,
        message: "User profile details",
        data: user
    });
};

export const updateProfile = async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();
    const userId = user.id;

    updateUserQuery.run({
        username: body.username,
        email: body.email,
        phone: body.phone,
        profile_img: body.profile_img,
        id: userId
    });

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
        message: "Update with success"
    })
};



export const deleteProfile = async (c: Context) => {
    const userId = c.get('user').id;

    db.query<unknown, { id: string }>(`UPDATE users SET account_status = 'deleted' WHERE id = $id`).run({ id: userId });

    return c.json({
        success: true,
        message: "Profile deleted successfully!",
    });
};
