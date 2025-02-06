import type { Context } from "hono";
import Request from "../models/request";

export const createRequest = async (c: Context) => {
    const body = await c.req.json();

    const request = new Request();
    request.beneficiary_id = c.get("user").id;
    request.title = body.title;
    request.description = body.description;
    request.location = body.location;
    request.urgency = body.urgency;
    request.status = body.status;
    request.create();

    // TODO: Implement logic to create a request
    return c.json({
        succes: true,
        message: "Request created successfully!",
        request,
    });
};

export const getRequests = async (c: Context) => {
    // TODO: Implement logic to fetch all requests
    return c.json({
        succes: true,
        message: "List of requests",
    });
};

export const getRequestById = async (c: Context) => {
    const { id } = c.req.param();
    // TODO: Implement logic to fetch a specific request by ID
    return c.json({
        succes: true,
        message: `Request ${id} details`,
    });
};

export const updateRequest = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.parseBody();
    // TODO: Implement logic to update a request
    return c.json({
        succes: true,
        message: `Request ${id} updated successfully!`,
    });
};

export const reviewRequest = async (c: Context) => {
    const { id } = c.req.param();
    const body = await c.req.parseBody();
    // TODO: Implement logic to review a request
    return c.json({
        succes: true,
        message: `Review added for request ${id}`,
    });
};

export const acceptRequest = async (c: Context) => {
    const { id } = c.req.param();
    // TODO: Implement logic to accept a request
    return c.json({
        succes: true,
        message: `Request ${id} accepted successfully!`,
    });
};

export const cancelRequest = async (c: Context) => {
    const { id } = c.req.param();
    // TODO: Implement logic to cancel a request
    return c.json({
        succes: true,
        message: `Request ${id} canceled successfully!`,
    });
};

export const completeRequest = async (c: Context) => {
    const { id } = c.req.param();
    // TODO: Implement logic to mark a request as completed
    return c.json({
        succes: true,
        message: `Request ${id} completed successfully!`,
    });
};
