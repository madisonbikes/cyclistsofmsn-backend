import { Request, Response } from "express";
import { Image, ImageDocument } from "../../database";
import { logger } from "../../utils";
import { putImageBodySchema } from "../contract";
import { lenientImageSchema } from "./localTypes";
import fsRepository from "../../fs_repository";
import { z } from "zod";

class ImagePut {
  bodySchema = putImageBodySchema;

  handler = async (req: Request, res: Response) => {
    const body = req.validated as z.infer<typeof putImageBodySchema>;

    const { id } = req.params;
    logger.trace({ id, body }, "put single image");

    const modified: Partial<ImageDocument> = { ...body };
    const oldValue = await Image.findByIdAndUpdate(id, modified);
    if (oldValue != null) {
      const newValue = await Image.findById(id);
      if (
        oldValue.description !== newValue?.description &&
        newValue?.description != null
      ) {
        // if the description changes, update the exif on the image
        await fsRepository.updatePhotoDescription(
          oldValue.filename,
          newValue.description,
        );
        await newValue.save();
      }
      res.send(lenientImageSchema.parse(newValue));
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
export default new ImagePut();
