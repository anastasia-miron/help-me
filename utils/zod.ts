import type { Hook } from "@hono/zod-validator";
import type { Env } from "hono";

export const zodCb: Hook<unknown, Env, string> = (result, c) => {
    if(!result.success) {
        return c.json({
            success: false,
            errors: result.error,
            message: "Invalid data provided"
        })
    }
}