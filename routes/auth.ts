import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { register, login, logout, completeRegister } from "../controllers/auth";
import { registerSchema, completeRegisterSchema } from "../schemas/registerSchema";
import { loginSchema } from "../schemas/loginSchema";
import { jwtVerify } from "../middlewares/jwtVerify";
import { zodCb } from "../utils/zod";

const route = new Hono();
route.post("register", zValidator('json', registerSchema, zodCb), register) ;
route.post("login", zValidator('json', loginSchema, zodCb), login);
route.post("logout", logout);
route.post("complete", jwtVerify, zValidator('json', completeRegisterSchema, zodCb), completeRegister);

export default route;

