import { Hono } from "hono";
import { createRequest, getRequests, getRequestById, updateRequest, reviewRequest, acceptRequest, cancelRequest, completeRequest } from "../controllers/requests";

const route = new Hono();
route.post("/", createRequest);
route.get("/", getRequests);
route.get("/:id", getRequestById);
route.put("/:id", updateRequest);
route.put("/:id/review", reviewRequest);
route.post("/:id/accept", acceptRequest);
route.post("/:id/cancel", cancelRequest);
route.post("/:id/complete", completeRequest);

export default route;
