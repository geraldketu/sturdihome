import { z } from "zod";

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").refine(value => new TextEncoder().encode(value).length <= 72, "Password must be no more than 72 UTF-8 bytes");
