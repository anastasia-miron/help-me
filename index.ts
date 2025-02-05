import { Hono } from "hono";  
import route from "./routes";
import { Database } from "bun:sqlite";
import { join } from "node:path";


const app = new Hono();
app.route("/api", route);

console.log(join(__dirname, `./database.db`))



console.log(route);

export default app;