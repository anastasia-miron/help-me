import { Hono } from "hono";
import { getProfile, updateProfile, deleteProfile, getProfileByUserName } from "../controllers/profile";
import { jwtVerify } from "../middlewares/jwtVerify";
import { zValidator } from "@hono/zod-validator";    
import { updateProfileSchema } from "../schemas/updateProfileSchema"

const route = new Hono();
route.get ("/" , jwtVerify, getProfile);
route.get ("/:username" , jwtVerify, getProfileByUserName);
route.put("/", jwtVerify, zValidator('json', updateProfileSchema), updateProfile);
route.delete("/", jwtVerify, deleteProfile);

export default route;
