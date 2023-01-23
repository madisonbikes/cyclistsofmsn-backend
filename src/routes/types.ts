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

export const imageSchema = z.object({
  id: z.coerce.string(),
  filename: z.string(),
  description: z.string().optional(),
});

export type Image = z.infer<typeof imageSchema>;

export const imageListSchema = imageSchema.array();

export type ImageList = z.infer<typeof imageListSchema>;

export const postSchema = z.object({
  id: z.coerce.string(),
  timestamp: z.coerce.date(),
  imageid: z.coerce.string(),
  status: z.object({
    flag: z.string(),
    error: z.string().optional(),
    uri: z.string().optional(),
  }),
});

export type Post = z.infer<typeof postSchema>;

export const loginSchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();
