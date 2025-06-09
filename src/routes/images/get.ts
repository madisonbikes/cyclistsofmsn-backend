import { Request, Response } from "express";
import { imageModel } from "../../database";
import fsRepository from "../../fs_repository";
import { access } from "fs/promises";
import { constants } from "fs";
import sharp from "sharp";
import { logger } from "../../utils";
import { getImageQuerySchema, GetImageQuery } from "../contract";
import { lenientImageSchema } from "./localTypes";
import fs_cache from "../../utils/persistent_cache";

class ImageGet {
  // expose for validation
  readonly querySchema = getImageQuerySchema;

  metadata = async (req: Request, res: Response) => {
    const { id } = req.params;
    const metadata = await imageModel.findById(id);
    if (metadata == null) {
      return res.sendStatus(404);
    }
    res.send(lenientImageSchema.parse(metadata));
  };

  binary = async (req: Request, res: Response) => {
    const query = req.validated as GetImageQuery;

    const { id } = req.params;
    logger.debug("loading image %s", id);

    const cachedBuffer = await this.loadFromCache(id, query);
    if (cachedBuffer !== undefined) {
      return res
        .type("jpeg")
        .set("Cache-Control", "max-age=3600, s-max-age=36000")
        .set("x-cached-response", "HIT")
        .send(cachedBuffer);
    }

    const filename = (await imageModel.findById(id))?.filename;
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

    logger.debug("resizing image %s", id);
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
    const images = await imageModel.findAll();
    logger.trace(images, "Found %d images in the database", images.length);
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
