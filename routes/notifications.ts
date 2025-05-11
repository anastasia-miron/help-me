import { Hono } from "hono";

import { jwtVerify } from "../middlewares/jwtVerify";
import {
  deleteAllNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notifications";

const route = new Hono();

route.get("/", jwtVerify, getNotifications);

route.put("/:id/read", jwtVerify, markNotificationRead);
route.put("/read-all", jwtVerify, markAllNotificationsRead);
route.delete("/all", jwtVerify, deleteAllNotifications);

export default route;
