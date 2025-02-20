import { Hono } from "hono";

import { jwtVerify } from "../middlewares/jwtVerify";
import { requestSSE } from "../controllers/sse";

const route = new Hono();

route.get('/:id', jwtVerify, requestSSE);

export default route;