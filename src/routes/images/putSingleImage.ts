import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Image, ImageClass } from "../../database";
import { logger } from "../../utils";
import { PutImageQuery, putImageQuerySchema } from "../types";

@injectable()
export class PutSingleImageHandler {
  readonly schema = putImageQuerySchema;

  handler = async (req: Request, res: Response) => {
    const query = req.validated as PutImageQuery;

    const id = req.params.id;
    logger.trace({ id, query }, "put single image");

    if (!isValidObjectId(id)) {
      // bad object id throws exception later, so check early
      return res.sendStatus(404);
    }

    const modified: Partial<ImageClass> = { ...query };
    if (query?.description !== undefined) {
      modified.description_from_exif = true;
    }

    const result = await Image.findByIdAndUpdate(id, query);
    if (result != null) {
      res.sendStatus(200);
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
