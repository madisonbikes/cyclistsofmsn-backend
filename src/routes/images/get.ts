import { Request, Response } from "express";
import { Image } from "../../database";
import { FilesystemRepository } from "../../fs_repository";
import { injectable } from "tsyringe";
import { access } from "fs/promises";
import { constants } from "fs";
import sharp from "sharp";
import { logger } from "../../utils";
import { getImageQuerySchema, GetImageQuery } from "../contract";
import { lenientImageSchema } from "./localTypes";

@injectable()
export class SingleImageGet {
  constructor(private fsRepository: FilesystemRepository) {}

  readonly querySchema = getImageQuerySchema;

  metadata = async (req: Request, res: Response) => {
    const id = req.params.id;
    const metadata = await Image.findById(id).and([{ deleted: false }]);
    if (metadata == null) {
      return res.sendStatus(404);
    }
    res.send(lenientImageSchema.parse(metadata));
  };

  binary = async (req: Request, res: Response) => {
    const query = req.validated as GetImageQuery;

    const id = req.params.id;
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
