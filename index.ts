import { Hono } from "hono";  
import { cors } from 'hono/cors'
import route from "./routes";

import transporter from "./service/email.service";
import cron from "./hooks/cron";

const app = new Hono();

// Init Cron jobs
cron();

app.use("*", cors({
    origin: '*',
    // allowHeaders: ['Content-Type', 'Authorization'],
    // exposeHeaders: ['Content-Type', 'Content-Length', 'Cache-Control', 'X-Accel-Buffering', 'Connection']
    credentials: true
}))
app.route("/api", route);

export default app;