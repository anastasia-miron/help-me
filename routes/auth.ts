import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { register, login, logout, completeRegister } from "../controllers/auth";
import { registerSchema, completeRegisterSchema } from "../schemas/registrater";
import { loginSchema } from "../schemas/login";
import { jwtVerify } from "../middlewares/jwtVerify";

const route = new Hono();
route.post("register", zValidator('json', registerSchema), register) ;
route.post("login", zValidator('json', loginSchema), login);
route.post("logout", logout);
route.post("complete", jwtVerify, zValidator('json', completeRegisterSchema), completeRegister);

export default route;

