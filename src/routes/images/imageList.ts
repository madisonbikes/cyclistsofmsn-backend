import { Request, Response } from "express";
import { Image } from "../../database";
import { imageSchema } from "../contract";
import { z } from "zod";

// database could, in theory, not have fs_timestamp defined
// but very unlikely because it should only happen with deleted
// images, which are filtered out. In that event, set date to 0.
const lenientImageSchema = imageSchema.extend({
  fs_timestamp: z.coerce.date().default(new Date(0)),
});

export const handler = async (_req: Request, res: Response) => {
  const images = await Image.find({ deleted: false });
  const retval = lenientImageSchema.array().parse(images);
  res.send(retval);
};
