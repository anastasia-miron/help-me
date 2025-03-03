import { Hono } from "hono";
import { beneficiaryGuard, volunteerGuard } from "../middlewares/roleGuard";
import { zValidator } from "@hono/zod-validator";
import { createReviewSchema } from "../schemas/review.Schema";
import { jwtVerify } from "../middlewares/jwtVerify";
import { deleteReview, getReviews, updateReview } from "../controllers/reviews";
import { zodCb } from "../utils/zod";





const route = new Hono();

route.get("/", jwtVerify, getReviews);
route.put("/:id", jwtVerify, zValidator('json', createReviewSchema, zodCb), updateReview);
route.delete("/:id", jwtVerify, deleteReview);


export default route;