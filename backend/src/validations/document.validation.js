import { z } from "zod";

export const patchDocSchema = z.object({
  title: z.string().min(1).max(500),
});