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
    if (modified.description != null) {
      modified.description_from_exif = false;
    }

    const oldValue = await Image.findByIdAndUpdate(id, modified);
    if (oldValue != null) {
      const newValue = await Image.findById(id);
      if (
        oldValue.description !== newValue?.description &&
        newValue?.description != null
      ) {
        await this.fsRepository.updateImageDescription(
          id,
          newValue?.description,
        );
      }
      res.send(lenientImageSchema.parse(newValue));
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
