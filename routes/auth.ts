import { Hono } from "hono";
import { register, login, logout } from "../controllers/auth";

const route = new Hono();
route.post("register", register);
route.post("login", login);
route.post("logout", logout);

export default route;

