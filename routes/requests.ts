import { Hono } from "hono";
import { createRequest, getRequests, getRequestById, updateRequest, createReviewRequest,updateReviewRequest,acceptRequest, cancelRequest, completeRequest, rejectRequest, getRequestsHistory, getRequestMessages, createRequestMessage } from "../controllers/requests";
import { jwtVerify } from "../middlewares/jwtVerify";
import { beneficiaryGuard, volunteerGuard } from "../middlewares/roleGuard";
import { zValidator } from "@hono/zod-validator";
import { createRequestSchema } from "../schemas/createRequestSchema";
import { updateRequestSchema } from "../schemas/updateRequestSchema";
import { createReviewSchema } from "../schemas/review.Schema";
import { messageSchema } from "../schemas/messageSchema";
import { zodCb } from "../utils/zod";




const route = new Hono();
route.post("/", jwtVerify, beneficiaryGuard, zValidator('json', createRequestSchema, zodCb), createRequest);
route.get("/", jwtVerify, getRequests);
route.get("/history",jwtVerify, getRequestsHistory);
route.get("/:id", jwtVerify, getRequestById);
route.put("/:id", jwtVerify, beneficiaryGuard, zValidator('json', updateRequestSchema, zodCb), updateRequest);
route.post("/:id/review", jwtVerify,  zValidator('json', createReviewSchema, zodCb), createReviewRequest);
route.put("/:id/review/:reviewId", jwtVerify, zValidator('json', createReviewSchema, zodCb), updateReviewRequest);
route.post("/:id/accept", jwtVerify, volunteerGuard, acceptRequest);
route.post("/:id/cancel", jwtVerify, beneficiaryGuard, cancelRequest);
route.post("/:id/reject", jwtVerify, rejectRequest);
route.post("/:id/complete", jwtVerify, volunteerGuard, completeRequest);
route.get("/:id/messages", jwtVerify, getRequestMessages);
route.post("/:id/messages", jwtVerify, zValidator('json', messageSchema, zodCb), createRequestMessage);

export default route;
