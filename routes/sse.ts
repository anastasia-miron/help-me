import { Hono } from "hono";

import { jwtVerify } from "../middlewares/jwtVerify";
import { messagesSSE, notificationSSE, requestSSE } from "../controllers/sse";

const route = new Hono();

route.get("/notifications", jwtVerify, notificationSSE);
route.get("/recieve_message", jwtVerify, messagesSSE);
route.get("/:id", jwtVerify, requestSSE);

export default route;