import { Context } from "koa";
import sharp from "sharp";
import { Image } from "../schema/images.model";
import { repository } from "../fs_repository";

class ImageController {
  public async getImageList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const images = await Image.find({ deleted: false });
    ctx.body = images.map(doc => {
      return { id: doc.id, filename: doc.filename };
    });
  }


  // FIXME no caching at all right now
  public async getOneImage(ctx: Context, id: string) {
    const filename = (await
        Image.findById(id)
          .and([{ deleted: false }])
    )
      ?.filename;
    if (filename === undefined) return;

    const imageFile = repository().photoPath(filename);

    let width = safeParseInt(ctx.query.width);
    const height = safeParseInt(ctx.query.height);
    if (!width && !height) {
      width = 1024;
    }

    const buffer = await sharp(imageFile)
      .resize({ width, height, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();
    ctx.type = "jpeg";
    ctx.set("Cache-Control", "max-age=3600, s-max-age=36000");
    ctx.body = buffer;
  }
}

function safeParseInt(value?: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}

export const imageController = new ImageController();
