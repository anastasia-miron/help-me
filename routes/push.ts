// routes/push.ts
import { Hono } from "hono";
import { jwtVerify } from "../middlewares/jwtVerify";
import {
  allowNotification,
  getisNotificationEnabled,
  getVapidKey,
  subscribePush,
} from "../controllers/push";

const app = new Hono();

app.get("/vapidPublicKey", jwtVerify, getVapidKey);
app.get("/getIsNotificationEnabled", jwtVerify, getisNotificationEnabled);

app.post("/subscribe", jwtVerify, subscribePush);
app.post("/allowNotifications", jwtVerify, allowNotification);

export default app;
