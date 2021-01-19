import { Context } from "koa";
import fs from "fs";
const folder = "/home/tsandee/CyclistsOfMadison/photos";

class ImageController {
  public async getImageList(ctx: Context): Promise<void> {
    ctx.body = [new ImageInfo(), new ImageInfo()];
  }

  public async getOneImage(ctx: Context, id: number): Promise<void> {}
}

export const imageController = new ImageController();
export class ImageInfo {
  id = 0;
  filename = "";
}
