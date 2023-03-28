import { Request, Response } from "express";
import { Image, ImageDocument } from "../../database";
import { logger } from "../../utils";
import { PutImageBody, putImageBodySchema } from "../contract";
import { lenientImageSchema } from "./localTypes";

export const bodySchema = putImageBodySchema;

export const handler = async (req: Request, res: Response) => {
  const body = req.validated as PutImageBody;

  const { id } = req.params;
  logger.trace({ id, body }, "put single image");

  const modified: Partial<ImageDocument> = { ...body };
  if (modified.description != null) {
    modified.description_from_exif = false;
  }

  const result = await Image.findByIdAndUpdate(id, modified, { new: true });
  if (result != null) {
    res.send(lenientImageSchema.parse(result));
  } else {
    // not found
    res.sendStatus(404);
  }
};
