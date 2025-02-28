import type { Context } from "hono";
import Request, { RequestStatusEnum } from "../models/request";
import Review from "../models/reviews";
import User, { UserTypeEnum } from "../models/user";
import type { ReviewPayload } from "../types/type";
import pubsub from "../utils/pubsub";
import Message from "../models/message";
import { sleep } from "bun";



export const createRequest = async (c: Context) => {
    const body = await c.req.json();

    const request = new Request();
    request.beneficiary_id = c.get("user").id;
    request.title = body.title;
    request.description = body.description;
    request.location = body.location;
    request.urgency = body.urgency;
    request.create();

    pubsub.broadcast('message', { message: 'New request created' });

    // TODO: Implement logic to create a request
    return c.json({
        success: true,
        data: request,
    });
};

export const getRequests = async (c: Context) => {
    const requests = Request.findAll();
    return c.json({
        success: true,
        data: requests
    });
};

export const getRequestsHistory = async (c: Context) => {
    const user = c.get('user') as User;
    const requests = Request.findCompleted(user!);
    return c.json({
        success: true,
        data: requests
    });
}

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

    const message = new Message();
    message.is_system = true;
    message.request_id = request.id;
    message.content = "Request updated";
    message.create();

    pubsub.broadcast('message', {message});

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

    let review = Review.findByRequest(request.id, user.id);

    if (!review) {
        review = new Review();
        review.request_id = request.id;
        review.from_id = c.get("user").id;
        review.to_id = user.type === UserTypeEnum.BENEFICIARY ? request.volunteer_id! : request.beneficiary_id;
        review.rating = body.rating;
        review.comment = body.comment;
        review.create();
    } else {
        review.rating = body.rating;
        review.comment = body.comment;
        review.update();
    }

    // TODO: Implement logic to review a request
    return c.json({
        success: true,
        data: review,
    });
};



export const updateReviewRequest = async (c: Context) => {
    const { id, reviewId } = c.req.param();
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
        data: review,
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

    const message = new Message();
    message.is_system = true;
    message.request_id = request.id;
    message.content = `Request accepted by ${c.get("user").username}`;
    message.create();

    pubsub.broadcast('message', {message});

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

    const message = new Message();
    message.is_system = true;
    message.request_id = request.id;
    message.content = `Request cancelled by ${c.get("user").username}`;
    message.create();

    pubsub.broadcast('message', {message});

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


    const message = new Message();
    message.is_system = true;
    message.request_id = request.id;
    message.content = `Request rejected by ${c.get("user").username}`;
    message.create();

    pubsub.broadcast('message', {message});

    return c.json({
        success: true,
        data: request,
    });
};

const isReviewPayload = (data: unknown): data is ReviewPayload => {
    if (typeof data !== "object" || data === null) {
        return false;
    }

    return Object.keys(data).length > 0;
}

export const completeRequest = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.json<ReviewPayload>()
    const request = Request.findById(id);
    const user = c.get("user");
    if (!request) {
        return c.notFound();
    }

    if (request.status !== RequestStatusEnum.IN_PROGRESS) {
        return c.json({
            success: false,
            message: "Request is not in progress",
        });
    }

    if (isReviewPayload(body)) {
        const review = new Review();
        review.request_id = request.id;
        review.from_id = user.id;
        review.to_id = request.beneficiary_id!;
        review.rating = body.rating;
        review.comment = body.comment;
        review.create();
    }

    request.complete();

    const message = new Message();
    message.is_system = true;
    message.request_id = request.id;
    message.content = `Request completed by ${c.get("user").username}`;
    message.create();

    pubsub.broadcast('message', {message});

    return c.json({
        success: true,
        data: request
    });
};


export const getRequestMessages = async (c: Context) => {
    const { id } = c.req.param();
    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }
    const messages = Message.findByRequest(request.id);
    return c.json({
        success: true,
        data: messages,
    });
};

export const createRequestMessage = async (c: Context) => {
    const { id } = c.req.param();
    const user_id = c.get("user").id;
    const body = await c.req.json();
    const request = Request.findById(id);
    if (!request) {
        return c.notFound();
    }
    if (request.beneficiary_id !== user_id && request.volunteer_id !== user_id) {
        return c.json({
            success: false,
            message: "Forbidden",
        }, 403);
    }
    const message = new Message();
    message.request_id = request.id;
    message.user_id = c.get("user").id;
    message.content = body.content;
    message.create();

    pubsub.broadcast('message', { message });

    return c.json({
        success: true,
        data: message,
    });
};
