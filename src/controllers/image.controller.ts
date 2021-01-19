import { Context } from "koa";
import { getConnection, Repository } from "typeorm";
import { Image } from "../entity/Image";

class ImageController {
  #repository: Repository<Image> | undefined;

  get repository(): Repository<Image> {
    return (this.#repository ??= getConnection().getRepository(Image));
  }

  public async getImageList(ctx: Context) {
    ctx.body = await this.repository.find();
  }

  public async getOneImage(ctx: Context, id: number) {
    ctx.body = await this.repository.findOne(id);
  }
}

export const imageController = new ImageController();
