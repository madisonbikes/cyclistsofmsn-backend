import { z } from "zod";

export const mediaUploadResponseSchema = z.object({ id: z.string() });

export const statusUpdateVisibilitySchema = z.enum([
  "public",
  "unlisted",
  "private",
  "direct",
]);
export type StatusUpdateVisibility = z.infer<
  typeof statusUpdateVisibilitySchema
>;
export const statusUpdateRequestSchema = z.object({
  status: z.string(),
  visibility: statusUpdateVisibilitySchema.optional(),
  media_ids: z.string().array(),
});
export type StatusUpdateRequest = z.infer<typeof statusUpdateRequestSchema>;
export const statusUpdateResponseSchema = z.object({ id: z.string() });
