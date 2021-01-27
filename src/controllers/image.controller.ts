import { Context } from "koa";
import { Image } from "../entity/Image";
import { configuration } from "../config";
import { database } from "../database";
import sharp from "sharp";

class ImageController {
  public async getImageList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const repository = await database.getRepository(Image);
    ctx.body = await repository.find();
  }

  private parseIntWithUndefined(str: string | undefined) {
    if (str) {
      return parseInt(str);
    } else {
      return undefined;
    }
  }

  // FIXME no caching at all right now
  public async getOneImage(ctx: Context, id: number) {
    const repository = await database.getRepository(Image);
    const filename = (await repository.findOne(id))?.filename;
    if (filename) {
      const resolved = `${configuration.photos_dir}/${filename}`;
      let width = this.parseIntWithUndefined(ctx.query.width);
      const height = this.parseIntWithUndefined(ctx.query.height);
      if (!width && !height) {
        width = 1024;
      }

      const buffer = await sharp(resolved)
        .resize({ width, height, withoutEnlargement: true })
        .toFormat("jpeg")
        .toBuffer();
      ctx.type = "jpeg";
      ctx.set("Cache-Control", "max-age=3600, s-max-age=36000");
      ctx.body = buffer;
    }
  }
}

export const imageController = new ImageController();
