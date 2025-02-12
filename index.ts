import { Hono } from "hono";  
import { cors } from 'hono/cors'
import route from "./routes";
import { Database } from "bun:sqlite";
import { join } from "node:path";


const app = new Hono();
app.use("*", cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
}))
app.route("/api", route);

export default app;