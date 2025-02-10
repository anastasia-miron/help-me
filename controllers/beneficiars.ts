import type { Context } from "hono";
import Beneficiary from "../models/beneficiary";
import Request from "../models/request";

export const getBeneficiaries = async (c: Context) => {
    const beneficiaries = await Beneficiary.findAll();
    return c.json({
        success: true,
        data: beneficiaries,
    });
};

export const getBeneficiaryById = async (c: Context) => {
    const { id } = c.req.param();
    const beneficiary = await Beneficiary.findById(id);

    if (!beneficiary) {
        return c.notFound();
    }

    return c.json({
        success: true,
        data: beneficiary,
    });
};

export const getBeneficiaryRequests = async (c: Context) => {
    const { id } = c.req.param();
    const requests = await Request.findByBeneficiaryId(id);

    return c.json({
        success: true,
        data: requests,
    });
};
