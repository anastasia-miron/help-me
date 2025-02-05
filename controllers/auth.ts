import type { Context } from "hono";

export const register = async (c: Context) => {
    const body = await c.req.parseBody();
    const { email, password } = body;
    // TODO: Implement registration logic
    return c.json({ message: "Registration successful!", success: true});
}

export const login = async (c: Context) => {
    const body = await c.req.parseBody();
    const { email, password } = body;
    // TODO: Implement login logic
    return c.json({ message: "Login successful!", succes: true});
}

export const logout = async (c: Context) => {
    // TODO: Implement logout logic
    return c.json({ message: "Logout successful!", succes: true});
}
 