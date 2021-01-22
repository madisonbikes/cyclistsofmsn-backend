import { Context } from "koa";
import { getConnection, Repository } from "typeorm";
import { Image } from "../entity/Image";
import { PHOTOS_DIR } from "../env";
import sharp from "sharp";

class ImageController {
  #repository: Repository<Image> | undefined;

  get repository(): Repository<Image> {
    return (this.#repository ??= getConnection().getRepository(Image));
  }

  public async getImageList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    ctx.body = await this.repository.find();
  }

  private parseIntWithUndefined(str: string | undefined) {
    if (str) {
      return parseInt(str);
    } else {
      return undefined;
    }
  }
  public async getOneImage(ctx: Context, id: number) {
    const filename = (await this.repository.findOne(id))?.filename;
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
