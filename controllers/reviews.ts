import type { Context } from "hono";
import Review from "../models/reviews";
import User from "../models/user";
import type { ReviewPayload } from "../types/type";
import Request, { RequestStatusEnum } from "../models/request";


export const getReviews = async (c: Context) => {
    const user = c.get("user");
    const reviews = Review.findAll(user.id);
    
    return c.json({
        success: true,
        data: reviews,
    });
};

export const getReviewById = async (c: Context) => {
    const { id } = c.req.param();
    const review = Review.findById(id);
    if (!review) {
        return c.notFound();
    }
    return c.json({
        success: true,
        data: review,
    });
};

export const updateReview = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.json();

    const review = Review.findById(id);
    console.log(review)
    if (!review) {
        return c.notFound();
    }

    review.rating = body.rating;
    review.comment = body.comment;
     review.update();

    return c.json({
        success: true,
        data: review,
    });
};

export const deleteReview = async (c: Context) => {
    const { id } = c.req.param();
    const review = Review.findById(id);
    if (!review) {
        return c.notFound();
    }

    review.delete();

    return c.json({
        success: true,
        message: "Review deleted successfully",
    });
};
