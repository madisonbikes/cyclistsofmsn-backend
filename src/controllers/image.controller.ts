import { Context } from "koa";
import { Repository } from "typeorm";
import { getRepository } from "../connection";
import { Image } from "../entity/Image";
import { PHOTOS_DIR } from "../env";
import sharp from "sharp";

class ImageController {
  async repository(): Promise<Repository<Image>> {
    return getRepository(Image);
  }

  public async getImageList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const repository = await this.repository();
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
    const repository = await this.repository();
    const filename = (await repository.findOne(id))?.filename;
    if (filename) {
      const resolved = `${PHOTOS_DIR}/${filename}`;
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
