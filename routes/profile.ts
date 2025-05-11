import { Hono } from "hono";
import { getProfile, updateProfile, deleteProfile, updateProfilePassword, getProfileById } from "../controllers/profile";
import { jwtVerify } from "../middlewares/jwtVerify";
import { zValidator } from "@hono/zod-validator";    
import { updateProfileSchema } from "../schemas/updateProfileSchema"
import { zodCb } from "../utils/zod";

const route = new Hono();
route.get ("/" , jwtVerify, getProfile);
route.get ("/:id" , jwtVerify, getProfileById);
route.put("/", jwtVerify, zValidator('json', updateProfileSchema, zodCb), updateProfile);
route.post('/update-password', jwtVerify, updateProfilePassword);
route.delete("/", jwtVerify, deleteProfile);

export default route;
