import express from "express";
import sharp from "sharp";
import { Image } from "../database";
import { FilesystemRepository } from "../fs_repository";
import { access } from "fs/promises";
import { constants } from "fs";
import { injectable } from "tsyringe";
import { logger } from "../utils";
import { isValidObjectId } from "mongoose";
import Cache from "./cache";
import { z } from "zod";
import { validateQuerySchema } from "../security/validateSchema";

const optionalNumberSchema = z.preprocess((arg) => {
  if (arg === undefined) {
    return undefined;
  } else {
    return parseInt(arg as string);
  }
}, z.number().optional());

const getQuerySchema = z.object({
  width: optionalNumberSchema,
  height: optionalNumberSchema,
});

type GetQuerySchema = z.infer<typeof getQuerySchema>;

@injectable()
class ImageRouter {
  constructor(
    private cache: Cache,
    private fsRepository: FilesystemRepository
  ) {}

  readonly routes = express
    .Router()
    // all images
    .get("/", async (_req, res) => {
      res.set("Cache-Control", "max-age=60, s-max-age=3600");
      const images = await Image.find({ deleted: false });
      res.send(
        images.map((doc) => {
          return { id: doc.id, filename: doc.filename };
        })
      );
    })

    // single image, cached
    .get(
      "/:id",
      validateQuerySchema(getQuerySchema),
      this.cache.middleware(),
      async (req, res) => {
        if (await this.cache.isCached(res)) return;
        const query = req.validated as GetQuerySchema;

        const id = req.params.id;
        if (!isValidObjectId(id)) {
          // bad object id throws exception later, so check early
          return res.sendStatus(404);
        }
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

        const buffer = await sharp(imageFile)
          .resize({ width, height: query.height, withoutEnlargement: true })
          .toFormat("jpeg")
          .toBuffer();

        return res
          .type("jpeg")
          .set("Cache-Control", "max-age=3600, s-max-age=36000")
          .send(buffer);
      }
    );
}

export default ImageRouter;
