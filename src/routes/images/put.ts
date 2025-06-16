import type { Request, Response } from "express";
import { logger } from "../../utils";
import { putImageBodySchema } from "../contract";
import { lenientImageSchema } from "./localTypes";
import fsRepository from "../../fs_repository";
import { z } from "zod";
import type { DbImage } from "../../database/types";
import { imageModel } from "../../database/database";

class ImagePut {
  bodySchema = putImageBodySchema;

  handler = async (req: Request, res: Response) => {
    const body = req.validated as z.infer<typeof putImageBodySchema>;

    const { id } = req.params;
    logger.trace({ id, body }, "put single image");

    const modified: Partial<DbImage> = { ...body };
    const oldValue = await imageModel.updateOne(id, modified);
    if (oldValue != null) {
      const newValue = await imageModel.findById(id);
      if (
        oldValue.description !== newValue?.description &&
        newValue?.description != null
      ) {
        // if the description changes, update the exif on the image
        await fsRepository.updatePhotoDescription(
          oldValue.filename,
          newValue.description,
        );
      }
      res.send(lenientImageSchema.parse(newValue));
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
export default new ImagePut();
