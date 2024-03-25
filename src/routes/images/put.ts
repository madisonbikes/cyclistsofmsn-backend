import { Request, Response } from "express";
import { Image, ImageDocument } from "../../database";
import { logger } from "../../utils";
import { PutImageBody, putImageBodySchema } from "../contract";
import { lenientImageSchema } from "./localTypes";
import { fsRepository } from "../../fs_repository";

class ImagePut {
  bodySchema = putImageBodySchema;

  async handler(req: Request, res: Response) {
    const body = req.validated as PutImageBody;

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
        await fsRepository.updateImageDescription(
          oldValue.filename,
          newValue?.description,
        );
        await newValue.save();
      }
      res.send(lenientImageSchema.parse(newValue));
    } else {
      // not found
      res.sendStatus(404);
    }
  }
}
export default new ImagePut();
