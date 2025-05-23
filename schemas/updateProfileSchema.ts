import { z } from "zod";


export const updateProfileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().length(9, "Phone number must be at least 9 digits").optional(),
  profileImg: z.string().url("Invalid URL").optional(),
  skills: z.string().nullable().optional(),
  availability: z.string().nullable().optional(),
  needs: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (!data.skills && !data.needs) {
    ctx.addIssue({
      path: ["skills"],
      message: "Skills or Needs are required fields",
      code: "custom",
    });
  }

  if (data.skills && !data.availability) {
    ctx.addIssue({
      path: ["availability"],
      message: "Availability are required field",
      code: "custom",
    });
  }
  if (!data.skills && data.availability) {
    ctx.addIssue({
      path: ["skills"],
      message: "Skills are required field",
      code: "custom",
    });
  }
  if (data.needs && !data.location) {
    ctx.addIssue({
      path: ["location"],
      message: "Location are required field",
      code: "custom",
    });
  }
  if (!data.needs && data.location) {
    ctx.addIssue({
      path: ["needs"],
      message: "Needs are required field",
      code: "custom",
    });
  }

});
