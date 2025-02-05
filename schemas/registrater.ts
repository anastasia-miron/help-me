
import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    username: z.string().min(3, 'Username must be at least 3 characters long'),
});

export const completeRegisterSchema = z.object({
    type: z.enum(["volunteer", "beneficiary"]),
    skills: z.string().optional(),
    location: z.string().optional(),
    needs: z.string().optional(),
    availability: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type === "volunteer") {
        if (!data.skills) {
            ctx.addIssue({
                path: ["skills"],
                message: "Skills are required for volunteers",
                code: "custom",
            });
        }

        if (!data.availability) {
            ctx.addIssue({
                path: ["availability"],
                message: "Availability are required for volunteers",
                code: "custom",
            });
        }
    } else if(data.type === "beneficiary") {
        if (!data.needs) {
            ctx.addIssue({
                path: ["needs"],
                message: "Needs are required for beneficiaries",
                code: "custom",
            });
        }

        if (!data.location) {
            ctx.addIssue({
                path: ["location"],
                message: "Location are required for beneficiaries",
                code: "custom",
            });
        }
    }   
})