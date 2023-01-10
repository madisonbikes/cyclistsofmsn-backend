import { Request, Response } from "express";
import { Image } from "../../database";

export const handler = async (req: Request, res: Response) => {
  res.set("Cache-Control", "max-age=60, s-max-age=3600");
  const images = await Image.find({ deleted: false });
  res.send(
    images.map((doc) => {
      return { id: doc.id, filename: doc.filename };
    })
  );
};
