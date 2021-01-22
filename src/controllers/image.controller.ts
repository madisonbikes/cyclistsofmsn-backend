import { Context } from "koa";
import { getConnection, Repository } from "typeorm";
import { Image } from "../entity/Image";
import path from "path";
import { createReadStream } from "fs";
import { PHOTOS_DIR } from "../env";

class ImageController {
  #repository: Repository<Image> | undefined;

  get repository(): Repository<Image> {
    return (this.#repository ??= getConnection().getRepository(Image));
  }

  public async getImageList(ctx: Context) {
    ctx.body = await this.repository.find();
  }

  public async getOneImage(ctx: Context, id: number) {
    const filename = (await this.repository.findOne(id))?.filename;
    if (filename) {
      const resolved = `${PHOTOS_DIR}/${filename}`;
      ctx.type = path.parse(resolved).ext;
      ctx.body = createReadStream(resolved);
    }
  }
}

export const imageController = new ImageController();
