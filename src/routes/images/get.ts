import type { Request, Response } from "express";
import { Image } from "../../database/index.js";
import fsRepository from "../../fs_repository/index.js";
import { access } from "fs/promises";
import { constants } from "fs";
import sharp from "sharp";
import { logger } from "../../utils/index.js";
import { getImageQuerySchema, type GetImageQuery } from "../contract/index.js";
import { lenientImageSchema } from "./localTypes.js";
import fs_cache from "../../utils/persistent_cache.js";

class ImageGet {
  // expose for validation
  readonly querySchema = getImageQuerySchema;

  metadata = async (req: Request, res: Response) => {
    const { id } = req.params;
    const metadata = await Image.findById(id).and([{ deleted: false }]);
    if (metadata == null) {
      return res.sendStatus(404);
    }
    res.send(lenientImageSchema.parse(metadata));
  };

  binary = async (req: Request, res: Response) => {
    const query = req.validated as GetImageQuery;

    const { id } = req.params;
    logger.debug(`loading image ${id}`);

    const cachedBuffer = await this.loadFromCache(id, query);
    if (cachedBuffer !== undefined) {
      return res
        .type("jpeg")
        .set("Cache-Control", "max-age=3600, s-max-age=36000")
        .set("x-cached-response", "HIT")
        .send(cachedBuffer);
    }

    const filename = (await Image.findById(id).and([{ deleted: false }]))
      ?.filename;
    if (filename === undefined) {
      return res.sendStatus(404);
    }

    const imageFile = fsRepository.photoPath(filename);

    let { width } = query;
    if (width === undefined && query.height === undefined) {
      width = 1024;
    }

    // FIXME let's find a better pattern for this instead of tight try/catch
    try {
      await access(imageFile, constants.R_OK);
    } catch (_err) {
      logger.info(
        { imageFile },
        `Requested file not found in image repository`,
      );
      return res.sendStatus(404);
    }

    logger.debug(`resizing image ${id}`);
    const buffer = await sharp(imageFile)
      .resize({ width, height: query.height, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();

    await this.storeToCache(id, query, buffer);

    return res
      .type("jpeg")
      .set("Cache-Control", "max-age=3600, s-max-age=36000")
      .send(buffer);
  };

  listHandler = async (_req: Request, res: Response) => {
    const images = await Image.find({ deleted: false });
    const retval = lenientImageSchema.array().parse(images);
    res.send(retval);
  };

  private loadFromCache = async (id: string, query: GetImageQuery) => {
    const cacheKey = this.getCacheKey(id, query);
    return await fs_cache.get(cacheKey);
  };

  private storeToCache = async (
    id: string,
    query: GetImageQuery,
    buffer: Buffer,
  ) => {
    const cacheKey = this.getCacheKey(id, query);
    await fs_cache.put(cacheKey, buffer);
  };

  private getCacheKey = (id: string, query: GetImageQuery) => {
    return `image-${id}-${query.width}-${query.height}`;
  };
}

export default new ImageGet();
