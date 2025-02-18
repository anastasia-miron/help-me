import auth from "./auth";
import beneficiars from "./beneficiars";
import requests from "./requests";
import profile from "./profile";
import volunteers from "./volunteers";
import reviews from "./reviews";
import { Hono } from "hono";

const app = new Hono();

app.route("/auth", auth);
app.route("/beneficiars", beneficiars);
app.route("/requests", requests);
app.route("/profile", profile);
app.route("/volunteers", volunteers);
app.route("/reviews", reviews);

export default app;
