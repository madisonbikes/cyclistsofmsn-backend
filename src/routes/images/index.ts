import KoaRouter from "koa-router";
import sharp from "sharp";
import { Image } from "../../database";
import { FilesystemRepository } from "../../fs_repository";
import { access } from "fs/promises";
import { constants } from "fs";
import { injectable } from "tsyringe";
import { logger } from "../../utils";

@injectable()
export class ImageRouter extends KoaRouter {
  constructor(private fsRepository: FilesystemRepository) {
    super({ prefix: "/images" });

    this.get("/", async (ctx) => {
      ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
      const images = await Image.find({ deleted: false });
      ctx.body = images.map((doc) => {
        return { id: doc.id, filename: doc.filename };
      });
    });

    this.get("/:id", async (ctx) => {
      const id = ctx.params.id;
      let filename: string | undefined;

      // FIXME let's find a better pattern for this instead of very broad and tight try/catch
      try {
        filename = (await Image.findById(id).and([{ deleted: false }]))
          ?.filename;
        if (filename === undefined) return;
      } catch (err) {
        logger.info("Requested image id not found in db ", id);
        return;
      }

      const imageFile = this.fsRepository.photoPath(filename);

      let width = safeParseInt(ctx.query.width);
      const height = safeParseInt(ctx.query.height);
      if (!width && !height) {
        width = 1024;
      }

      // FIXME let's find a better pattern for this instead of tight try/catch
      try {
        await access(imageFile, constants.R_OK);
      } catch (err) {
        logger.info("Requested file not found in image repository ", imageFile);
        return;
      }

      const buffer = await sharp(imageFile)
        .resize({ width, height, withoutEnlargement: true })
        .toFormat("jpeg")
        .toBuffer();
      ctx.type = "jpeg";
      ctx.set("Cache-Control", "max-age=3600, s-max-age=36000");
      ctx.body = buffer;
    });
  }
}

function safeParseInt(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}