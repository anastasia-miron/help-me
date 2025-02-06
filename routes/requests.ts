import { Hono } from "hono";
import { createRequest, getRequests, getRequestById, updateRequest, reviewRequest, acceptRequest, cancelRequest, completeRequest } from "../controllers/requests";
import { jwtVerify } from "../middlewares/jwtVerify";
import { beneficiaryGuard, volunteerGuard } from "../middlewares/roleGuard";
import { zValidator } from "@hono/zod-validator";
import { createRequestSchema } from "../schemas/createRequestSchema";
import { updateRequestSchema } from "../schemas/updateRequestSchema";




const route = new Hono();
route.post("/", jwtVerify, beneficiaryGuard, zValidator('json', createRequestSchema), createRequest);
route.get("/", getRequests);
route.get("/:id", getRequestById);
route.put("/:id", jwtVerify, beneficiaryGuard, zValidator('json', updateRequestSchema), updateRequest);
route.put("/:id/review", jwtVerify, beneficiaryGuard, reviewRequest);
route.post("/:id/accept", jwtVerify, volunteerGuard, acceptRequest);
route.post("/:id/cancel", jwtVerify, beneficiaryGuard, cancelRequest);
route.post("/:id/complete", jwtVerify, volunteerGuard, completeRequest);

export default route;
