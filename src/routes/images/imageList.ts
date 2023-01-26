import { Request, Response } from "express";
import { Image } from "../../database";
import { lenientImageSchema } from "./localTypes";

export const handler = async (_req: Request, res: Response) => {
  const images = await Image.find({ deleted: false });
  const retval = lenientImageSchema.array().parse(images);
  res.send(retval);
};
