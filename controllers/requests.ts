import type { Context } from "hono";
import Request, { RequestStatusEnum } from "../models/request";
import Review from "../models/review";
import { UserTypeEnum } from "../models/user";

export const createRequest = async (c: Context) => {
    const body = await c.req.json();

    const request = new Request();
    request.beneficiary_id = c.get("user").id;
    request.title = body.title;
    request.description = body.description; 
    request.location = body.location;
    request.urgency = body.urgency;
    request.create();

    // TODO: Implement logic to create a request
    return c.json({
        success: true,
        message: "Request created successfully!",
        request,
    });
};

export const getRequests = async (c: Context) => {
    const requests = Request.findAll();
    return c.json({
        success: true,
        data: requests
    });
};

export const getRequestById = async (c: Context) => {
    const { id } = c.req.param();

    const request = Request.findById(id!);
    if (!request) {
        return c.notFound();
    }
    return c.json({
        success: true,
        data: request
    });
};

export const updateRequest = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.json();

    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }

    if (request.status !== RequestStatusEnum.OPEN) {
        return c.json({
            success: false,
            message: "Request is not open",
        });
    }

    request.title = body.title;
    request.description = body.description;
    request.location = body.location;
    request.urgency = body.urgency;
    request.update();


    return c.json({
        success: true,
        data: request,
    });
};

export const createReviewRequest = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.json();

    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }
    if (request.status !== RequestStatusEnum.DONE) {
        return c.json({
            success: false,
            message: "Request is not completed",
        });
    }

    const user = c.get("user");


    const review = new Review();
    review.request_id = request.id;
    review.from_id = c.get("user").id;
    review.to_id =  user.type === UserTypeEnum.BENEFICIARY ?  request.volunteer_id! : request.beneficiary_id;
    review.rating = body.rating;
    review.comment = body.comment;
    review.create();


    // TODO: Implement logic to review a request
    return c.json({
        success: true,
        message: request,
    });
};

export const updateReviewRequest = async (c: Context) => {
    const { id,  reviewId } = c.req.param();
    const body = await c.req.json();

    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }

    const review = Review.findById(reviewId);
    if (!review) {
        return c.notFound();
    }

    review.rating = body.rating;
    review.comment = body.comment;
    review.update();

    return c.json({
        success: true,
        message: review,
    });
}

export const acceptRequest = async (c: Context) => {
    const { id } = c.req.param();

    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }

    if (request.status !== RequestStatusEnum.OPEN) {
        return c.json({
            success: false,
            message: "Request is not open",
        });
    }

    request.accept(c.get("user").id);

    return c.json({
        success: true,
        data: request
    });
};

export const cancelRequest = async (c: Context) => {
    const { id } = c.req.param();
    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }

    if (request.status !== RequestStatusEnum.OPEN) {
        return c.json({
            success: false,
            message: "Request is not open",
        });
    }

    request.cancel();

    return c.json({
        success: true,
        data: request,
    });
};

export const rejectRequest = async (c: Context) => {
    const { id } = c.req.param();
    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }

    if (request.status !== RequestStatusEnum.IN_PROGRESS) {
        return c.json({
            success: false,
            message: "Request is not in progress",
        });
    }

    request.reject();

    return c.json({
        success: true,
        data: request,
    });
};

export const completeRequest = async (c: Context) => {
    const { id } = c.req.param();
    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }

 

    if (request.status !== RequestStatusEnum.IN_PROGRESS) {
        return c.json({
            success: false,
            message: "Request is not in progress",
        });
    }
    
    request.complete();

    return c.json({
        success: true,
        data: request
    });
};
