import { z } from "zod";

export const RepliesBody = z.object({
  comments: z.array(z.string().min(1)).min(1),
  persona: z.string().optional().default("helpful, concise, friendly"),
  language: z.string().optional().default("en"),
});
