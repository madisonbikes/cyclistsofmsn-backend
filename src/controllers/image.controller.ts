import { Context } from "koa";
import { configuration } from "../config";
import sharp from "sharp";
import { Image } from "../schema/images.model";

class ImageController {
  public async getImageList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const images = await Image.find({deleted: false});
    ctx.body = images.map(doc => {
      return { id: doc.id, filename: doc.filename };
    });
  }

  private static parseIntWithUndefined(str: string | undefined) {
    if (str !== undefined) {
      return parseInt(str);
    } else {
      return undefined;
    }
  }

  // FIXME no caching at all right now
  public async getOneImage(ctx: Context, id: string) {
    const filename = (await
      Image.findById(id)
        .and([{deleted: false}])
    )
      ?.filename;
    if (filename !== undefined) {
      const resolved = `${configuration.photos_dir}/${filename}`;
      let width = ImageController.parseIntWithUndefined(ctx.query.width);
      const height = ImageController.parseIntWithUndefined(ctx.query.height);
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
