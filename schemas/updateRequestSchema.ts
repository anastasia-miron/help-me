import { z } from "zod";

export const updateRequestSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long").optional(),
    description: z.string().min(10, "Description must be at least 10 characters long").optional(),
    urgency: z.enum(["low", "medium", "high"]).optional(),
    location: z.string().optional(),
});
