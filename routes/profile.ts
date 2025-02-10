import { Hono } from "hono";
import { getProfile, updateProfile, deleteProfile } from "../controllers/profile";
import { jwtVerify } from "../middlewares/jwtVerify";
import { zValidator } from "@hono/zod-validator";    
import { updateProfileSchema } from "../schemas/updateProfileSchema"

const route = new Hono();
route.get ("/" , jwtVerify, getProfile);
route.put("/", jwtVerify, zValidator('json', updateProfileSchema), updateProfile);
route.delete("/", jwtVerify, deleteProfile);

export default route;
