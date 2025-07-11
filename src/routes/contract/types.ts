import { z } from "zod/v4";

export const getImageQuerySchema = z.object({
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});
export type GetImageQuery = z.infer<typeof getImageQuerySchema>;

const mutableImageSchema = z.object({
  description: z.string().nullish(),
  hidden: z.boolean(),
});

export const putImageBodySchema = mutableImageSchema.partial();
export type PutImageBody = z.infer<typeof putImageBodySchema>;

export const imageSchema = mutableImageSchema.extend({
  id: z.coerce.string(),
  filename: z.string(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  fs_timestamp: z.coerce.date(),
  exif_createdon: z.coerce.date().optional(),
  description_from_exif: z.boolean(),
});
export type Image = z.infer<typeof imageSchema>;

export const imageListSchema = imageSchema.array();
export type ImageList = z.infer<typeof imageListSchema>;

export const postStatusFlagSchema = z.enum(["pending", "failed", "complete"]);
export type PostStatusFlag = z.infer<typeof postStatusFlagSchema>;

export const postStatusSchema = z.object({
  flag: postStatusFlagSchema,
  error: z.string().optional(),
  uri: z.string().optional(),
});
export type PostStatus = z.infer<typeof postStatusSchema>;

const mutablePostSchema = z.object({
  timestamp: z.coerce.date(),
  imageid: z.coerce.string().optional(),
  status: postStatusSchema,
});

export const putPostBodySchema = mutablePostSchema.partial();
export type PutPostBody = z.infer<typeof putPostBodySchema>;

export const postSchema = mutablePostSchema.extend({
  id: z.coerce.string(),
});
export type Post = z.infer<typeof postSchema>;

export const postListSchema = postSchema.array();
export type PostList = z.infer<typeof postListSchema>;

export const loginBodySchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();
export type LoginBody = z.infer<typeof loginBodySchema>;

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

export const getInfoSchema = z.object({
  version: z.string(),
});
export type GetInfo = z.infer<typeof getInfoSchema>;
