import type { Context } from "hono";
import Volunteer from "../models/volunteer";
import Request from "../models/request";

export const getVolunteers = async (c: Context) => {
    const volunteers = await Volunteer.findAll();
    return c.json({
        success: true,
        data: volunteers,
    });
};

export const getVolunteerById = async (c: Context) => {
    const { id } = c.req.param();
    const volunteer = await Volunteer.findById(id);
    
    if (!volunteer) {
        return c.notFound();
    }

    return c.json({
        success: true,
        data: volunteer,
    });
};

export const getVolunteerRequests = async (c: Context) => {
    const { id } = c.req.param();
    const requests = await Request.findByVolunteerId(id);

    return c.json({
        success: true,
        data: requests,
    });
};
