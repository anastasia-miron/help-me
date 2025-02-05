import { type Context } from "hono";
import jwt from "jsonwebtoken"

import User from "../models/user";
import { UserStatusEnum } from "../models/user";
import { JWT_SECRET } from "../constants";


export const register = async (c: Context) => {
    const body = await c.req.json();
    const { email, password, username } = body;
    const user = new User();
    user.email = email;
    user.password = password;
    user.username = username;

    try {
        user.create();
        return c.json({ message: "Registration successful!", success: true, email });
    } catch (error) {
        return c.json({ message: "Registration failed!", success: false });
    }
}

export const login = async (c: Context) => {
    const body = await c.req.json();
    const { email, password } = body;
    const user = User.getByEmail(email);
    
    if (!user) {
        return c.json({ message: "Invalid credentials", success: false });
    }

    if(user.status !== UserStatusEnum.ACTIVE) {
        return c.json({ message: "Invalid credentials", success: false });
    }


    const isValid = user.checkPassword(password)
    if(!isValid) {
        return c.json({ message: "Invalid credentials", success: false });
    }
    
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        type: user.type,
        username: user.username,
        profileImg: user.profile_img,
        is_verified: user.is_verified,
    }, JWT_SECRET, {
        expiresIn: "1d",
        issuer: "localhost",
        audience: "localhost"
    });

    return c.json({ message: "Login successful!", succes: true, token });
}

export const logout = async (c: Context) => {
    // TODO: Implement logout logic
    return c.json({ message: "Logout successful!", succes: true });
}

export const completeRegister = async (c: Context) => {
    const currentUser = c.get('user');
    console.log(currentUser);
    // TODO: Implement complete register logic
    return c.json({ message: "Complete registration successful!", succes: true });
}

