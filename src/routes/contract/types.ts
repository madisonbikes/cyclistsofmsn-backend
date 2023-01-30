import { z } from "zod";

export const getImageQuerySchema = z.object({
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});
export type GetImageQuery = z.infer<typeof getImageQuerySchema>;

export const putImageQuerySchema = z.object({
  description: z.string().optional(),
});
export type PutImageQuery = z.infer<typeof putImageQuerySchema>;

export const mutableImageSchema = z.object({
  description: z.string().optional(),
});
export type MutableImage = z.infer<typeof mutableImageSchema>;

export const imageSchema = mutableImageSchema.extend({
  id: z.coerce.string(),
  filename: z.string(),
  fs_timestamp: z.coerce.date(),
  exif_createdon: z.coerce.date().optional(),
});

export type Image = z.infer<typeof imageSchema>;

export const imageListSchema = imageSchema.array();

export type ImageList = z.infer<typeof imageListSchema>;

export const postStatusFlagSchema = z.enum(["pending", "failed", "complete"]);

export const postStatusSchema = z.object({
  flag: postStatusFlagSchema,
  error: z.string().optional(),
  uri: z.string().optional(),
});

export const postSchema = z.object({
  id: z.coerce.string(),
  timestamp: z.coerce.date(),
  imageid: z.coerce.string().optional(),
  status: postStatusSchema,
});

export type Post = z.infer<typeof postSchema>;

export const loginBodySchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();
export type LoginRequest = z.infer<typeof loginBodySchema>;

export const authenticatedUserSchema = z.object({
  username: z.string(),
  roles: z.string().array(),
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export const schedulePostOptionsSchema = z.object({
  when: z.coerce.date(),
  overwrite: z.boolean().default(false).optional(),
  selectImage: z.boolean().default(true).optional(),
});

export type SchedulePostOptions = z.infer<typeof schedulePostOptionsSchema>;
