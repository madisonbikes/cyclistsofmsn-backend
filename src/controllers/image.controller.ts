import { Context } from "koa";
import fs from "fs";
const folder = "/home/tsandee/CyclistsOfMadison/photos";

export class ImageController {
  public static async getImageList(ctx: Context): Promise<void> {
    ctx.body = [new ImageInfo(), new ImageInfo()];
  }

  public static async getOneImage(ctx: Context, id: number): Promise<void> {}
}

export class ImageInfo {
  id = 0;
  filename = "";
}
