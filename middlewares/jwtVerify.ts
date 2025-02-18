import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { getDatabase } from "../utils/database";
import User from "../models/user";
import type { UserTypeEnum } from "../models/user";

export type LocalJwtPayload = {
    user: {
        id: string,
        email: string,
        type: UserTypeEnum,
        username: string,
        profileImg: string,
        is_verified: boolean,
    }
}

const isPayload = (data: string | jwt.JwtPayload): data is LocalJwtPayload => {
    if (typeof data === "string") return false;
    return "user" in data
}


export const jwtVerify = async (c: Context, next: Next) => {
    const authorization = c.req.header('Authorization');

    if (!authorization) {
        return c.json({ message: "Unauthorized", success: false }, 401);
    }

    const token = authorization.replace('Bearer ', '');

    try {
        const parsedPayload = jwt.verify(token, JWT_SECRET);
        if (!isPayload(parsedPayload)) {
            return c.json({ message: "Unauthorized", success: false }, 401);
        }

        const db = getDatabase();
        const user = db.query<User, { id: string }>('SELECT * FROM users WHERE id = $id').as(User).get({ id: parsedPayload.user.id });
        if (!user) {
            return c.json({ message: "Unauthorized", success: false }, 401);
        }

        if (user.status !== "active") {
            return c.json({ message: "Unauthorized", success: false }, 401);
        }
        c.set('user', user);
        return next();
    } catch (error) {
        return c.json({ message: "Unauthorized", success: false }, 401);
    }
}