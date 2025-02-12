import { type Context } from "hono";
import jwt from "jsonwebtoken"

import User, { UserTypeEnum } from "../models/user";
import { UserStatusEnum } from "../models/user";
import { JWT_SECRET } from "../constants";
import Beneficiary from "../models/beneficiary";
import Volunteer from "../models/volunteer";


export const register = async (c: Context) => {
    const body = await c.req.json();
    const { email, password, username, phone } = body;
    const user = new User();
    user.email = email;
    user.password = password;
    user.username = username;
    user.phone = phone;

    try {
        user.create();
        return c.json({ success: true, data:  user.getJwtToken() });
    } catch (error) {

        return c.json({ success: false, message: "Registration failed!" });
    }
}

export const login = async (c: Context) => {
    const body = await c.req.json();
    const { email, password } = body;
    const user = User.getByEmail(email);

    if (!user) {
        return c.json({ success: false, message: "Invalid credentials" });
    }

    if (user.status !== UserStatusEnum.ACTIVE) {
        return c.json({ success: false, message: "Invalid credentials" });
    }


    const isValid = user.checkPassword(password)
    if (!isValid) {
        return c.json({ success: false, message: "Invalid credentials" });
    }



    return c.json({ success: true, data: user.getJwtToken() });
}

export const logout = async (c: Context) => {
    // TODO: Implement logout logic
    return c.json({ success: true, data: null });
}

export const completeRegister = async (c: Context) => {
    const body = await c.req.json();
    const currentUser = c.get('user');

    if (currentUser.type !== UserTypeEnum.NONE) {
        return c.json({ success: false, message: "Cannot redefine user type" });
    }

    currentUser.type = body.type;
    currentUser.update();

    if (body.type === "beneficiary") {
        // Create beneficiary 
        const entity = new Beneficiary();
        entity.user_id = currentUser.id;
        entity.needs = body.needs;
        entity.location = body.location;
        entity.create();


        return c.json({ success: true, data: entity });
    }

    if (body.type === "volunteer") {
        // Create volunteer
        const entity = new Volunteer();
        entity.user_id = currentUser.id;
        entity.skills = body.skills;
        entity.availability = body.availability;
        entity.create();

        currentUser.type = UserTypeEnum.VOLUNTEER;
        currentUser.update();

        return c.json({ success: true, data: entity });
    }
    return c.json({ success: false, message: "Registration failed!", });
}

