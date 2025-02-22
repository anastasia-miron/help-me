import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { register, login, logout, completeRegister, passwordRecovery, passwordChange } from "../controllers/auth";
import { registerSchema, completeRegisterSchema, passwordRecoverySchema, passwordChangeSchema } from "../schemas/registerSchema";
import { loginSchema } from "../schemas/loginSchema";
import { jwtVerify } from "../middlewares/jwtVerify";
import { zodCb } from "../utils/zod";

const route = new Hono();
route.post("register", zValidator('json', registerSchema, zodCb), register) ;
route.post("login", zValidator('json', loginSchema, zodCb), login);
route.post("logout", logout);
route.post("complete", jwtVerify, zValidator('json', completeRegisterSchema, zodCb), completeRegister);
route.post("recovery", zValidator('json', passwordRecoverySchema, zodCb), passwordRecovery);
route.post("recovery", zValidator('json', passwordChangeSchema, zodCb), passwordChange);

export default route;

