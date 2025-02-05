import { Hono } from "hono";
import { getProfile, updateProfile, deleteProfile } from "../controllers/profile";

const route = new Hono();
route.get ("/" , getProfile);
route.put("/", updateProfile);
route.delete("/", deleteProfile);

export default route;
