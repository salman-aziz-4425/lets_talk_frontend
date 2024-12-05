import { z } from "zod";

export const signInSchema = z.object({
  username: z.string().min(1, "Full Name is required"),
  password: z
    .string().min(1, "Password is required")
})
