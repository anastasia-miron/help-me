import { type Context } from "hono";
import jwt from "jsonwebtoken"

import User, { UserTypeEnum } from "../models/user";
import { UserStatusEnum } from "../models/user";
import { JWT_SECRET } from "../constants";
import Beneficiary from "../models/beneficiary";
import Volunteer from "../models/volunteer";


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
    const body = await c.req.json();
    const currentUser = c.get('user');

    console.log(currentUser);

    if (currentUser.type !== UserTypeEnum.NONE) {
        return c.json({ message: "Cannot redefine user type", success: false });
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


       return c.json({ message: "Beneficiary registration successful!", succes: true, entity });
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

        return c.json({ message: "Volunteer registration successful!", succes: true });
    }
    return c.json({ message: "Registration failed!", success: false });
}

