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

export const imageListSchema = z
  .object({
    id: z.string(),
    filename: z.string(),
    description: z.string().optional(),
  })
  .array();

export type ImageList = z.infer<typeof imageListSchema>;

export const loginSchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();
