import { z } from "zod";

export const createRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  urgency: z.enum(["low", "medium", "high"]),
  location: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
});
