import type { Context } from "hono";
import { getDatabase } from "../utils/database";
import { updateUserQuery, updateVolunteerQuery, updateBeneficiaryQuery } from "../db/queries";
import { UserTypeEnum } from "../models/user";

const db = getDatabase();

export const getProfile = async (c: Context) => {
    const userId = c.get('user').id;
    const user = db.query(`
        SELECT 
            u.id, u.username, u.email, u.phone, u.is_verified isVerified, u.created_at createdAt, u.type, u.profile_img as profileImg,
            v.skills, v.availability,
            b.needs, b.location,
            COALESCE(AVG(r.rating), 0) as rating
        FROM users u
        LEFT JOIN reviews r ON u.id = r.to_id
        LEFT JOIN volunteers v ON u.id = v.user_id
        LEFT JOIN beneficiaries b ON u.id = b.user_id
        WHERE u.id = ?
        GROUP BY u.id
    `).get(userId);

    if (!user) {
        return c.json({
            success: false,
            message: "User not found",
        }, 404);
    }

    return c.json({
        success: true,
        data: user
    });
};

export const getProfileByUserName = async (c: Context) => {
    const user = db.query(`
        SELECT 
            u.id, u.username, u.email, u.phone, u.is_verified isVerified, u.created_at createdAt, u.type, u.profile_img as profileImg,
            v.skills, v.availability,
            b.needs, b.location,
            COALESCE(AVG(r.rating), 0) as rating
        FROM users u
        LEFT JOIN reviews r ON u.id = r.to_id
        LEFT JOIN volunteers v ON u.id = v.user_id
        LEFT JOIN beneficiaries b ON u.id = b.user_id
        WHERE u.username = ? 
        GROUP BY u.id
    `).get(c.req.param('username')!);

    if (!user) {
        return c.json({
            success: false,
            message: "User not found",
        }, 404);
    }

    return c.json({
        success: true,
        data: user
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



export const deleteProfile = async (c: Context) => {
    const userId = c.get('user').id;

    db.query<unknown, { id: string }>(`UPDATE users SET account_status = 'deleted' WHERE id = $id`).run({ id: userId });

    return c.json({
        success: true,
        data: null
    });
};
