import { Request, Response } from "express";
import { Image, ImageDocument } from "../../database";
import { logger } from "../../utils";
import { PutImageBody, putImageBodySchema } from "../contract";
import { lenientImageSchema } from "./localTypes";
import { FilesystemRepository } from "../../fs_repository";
import { injectable } from "tsyringe";

export const bodySchema = putImageBodySchema;

@injectable()
export class ImagePut {
  constructor(private fsRepository: FilesystemRepository) {}

  handler = async (req: Request, res: Response) => {
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
        await this.fsRepository.updateImageDescription(
          oldValue.filename,
          newValue?.description,
        );

        // and reset the description_from_exif flag
        newValue.description_from_exif = true;
        await newValue.save();
      }
      res.send(lenientImageSchema.parse(newValue));
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
