import { z } from "zod/v4";

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
const _statusUpdateRequestSchema = z.object({
  status: z.string(),
  visibility: statusUpdateVisibilitySchema.optional(),
  media_ids: z.string().array(),
});
export type StatusUpdateRequest = z.infer<typeof _statusUpdateRequestSchema>;
export const statusUpdateResponseSchema = z.object({ id: z.string() });
