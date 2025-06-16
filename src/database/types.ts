import { z } from "zod";
import { ObjectId } from "mongodb";

export const dbImageSchema = z.object({
  _id: z.instanceof(ObjectId),
  filename: z.string(),
  fs_timestamp: z.coerce.date().nullish(),
  exif_createdon: z.coerce.date().nullish(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  description: z.string().nullish(),
  /**
   * this is unused now except for migration, but it used to be used to determine if the description
   * had been modified in the database but not in the image file.
   */
  description_from_exif: z.boolean().default(true),
  /**
   * If a file is deleted from the filesystem, set this to true but don't remove record, to
   * preserve referential integrity for posts.
   */
  deleted: z.boolean().default(false),
  /**
   * If a file is hidden, it will not be used for future posts.
   */
  hidden: z.boolean().default(false),
});

export type DbImage = z.infer<typeof dbImageSchema>;

const dbPostHistoryStatusSchema = z.object({
  flag: z.enum(["pending", "failed", "complete"]),
  error: z.string().nullish(),
  uri: z.string().nullish(),
});

export const dbPostHistorySchema = z.object({
  _id: z.instanceof(ObjectId),
  image: z.instanceof(ObjectId).nullish(),
  timestamp: z.coerce.date().default(() => new Date()), // default to now
  status: dbPostHistoryStatusSchema,
});

export type DbPostHistoryStatus = z.infer<typeof dbPostHistoryStatusSchema>;
export type DbPostHistory = z.infer<typeof dbPostHistorySchema>;

export const dbPopulatedPostHistorySchema = dbPostHistorySchema.extend({
  populatedImage: dbImageSchema.nullish(),
});

export type DbPopulatedPostHistory = z.infer<
  typeof dbPopulatedPostHistorySchema
>;

export const dbUserSchema = z.object({
  _id: z.instanceof(ObjectId),
  username: z.string(),
  hashed_password: z.string(),
  roles: z.array(z.string()).default([]),
});

export type DbUser = z.infer<typeof dbUserSchema>;

export const dbVersionSchema = z.object({
  version: z.number(),
});
export type DbVersion = z.infer<typeof dbVersionSchema>;
