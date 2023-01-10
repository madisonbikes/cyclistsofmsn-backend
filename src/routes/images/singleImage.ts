import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Image } from "../../database";
import { FilesystemRepository } from "../../fs_repository";
import { injectable } from "tsyringe";
import { access } from "fs/promises";
import { constants } from "fs";
import sharp from "sharp";
import { logger } from "../../utils";
import { GetImageQuerySchema } from "../types";
import { z } from "zod";

@injectable()
export class SingleImageHandler {
  constructor(private fsRepository: FilesystemRepository) {}

  readonly schema = GetImageQuerySchema;

  handler = async (req: Request, res: Response) => {
    const query = req.validated as z.infer<typeof GetImageQuerySchema>;

    const id = req.params.id;
    if (!isValidObjectId(id)) {
      // bad object id throws exception later, so check early
      return res.sendStatus(404);
    }

    logger.debug(`loading image ${id}`);
    const filename = (await Image.findById(id).and([{ deleted: false }]))
      ?.filename;
    if (filename === undefined) {
      return res.sendStatus(404);
    }

    const imageFile = this.fsRepository.photoPath(filename);

    let width = query.width;
    if (!width && !query.height) {
      width = 1024;
    }

    // FIXME let's find a better pattern for this instead of tight try/catch
    try {
      await access(imageFile, constants.R_OK);
    } catch (err) {
      logger.info(
        { imageFile },
        `Requested file not found in image repository`
      );
      return res.sendStatus(404);
    }

    logger.debug(`resizing image ${id}`);
    const buffer = await sharp(imageFile)
      .resize({ width, height: query.height, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();

    return res
      .type("jpeg")
      .set("Cache-Control", "max-age=3600, s-max-age=36000")
      .send(buffer);
  };
}
