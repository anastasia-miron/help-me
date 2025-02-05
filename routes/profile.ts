import { Hono } from "hono";
import { getProfile, updateProfile, deleteProfile } from "../controllers/profile";
import { jwtVerify } from "../middlewares/jwtVerify";

const route = new Hono();
route.get ("/" , jwtVerify, getProfile);
route.put("/", updateProfile);
route.delete("/", deleteProfile);

export default route;
