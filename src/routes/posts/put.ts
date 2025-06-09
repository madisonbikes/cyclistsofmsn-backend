import { Request, Response } from "express";
import { postHistoryModel } from "../../database";
import { logger } from "../../utils";
import { Post, PutPostBody, putPostBodySchema } from "../contract";
import { mapPostSchema } from "./types";

const bodySchema = putPostBodySchema;

const handler = async (req: Request, res: Response) => {
  const body = req.validated as PutPostBody;

  const { id } = req.params;
  logger.trace({ id, body }, "put single post");

  const result = await postHistoryModel.updateOne(id, body);
  if (result != null) {
    const newValue = await postHistoryModel.findById(id);
    if (newValue == null) {
      throw new Error("unexpected missing post");
    }
    res.send(mapPostSchema(newValue) satisfies Post);
  } else {
    // not found
    res.sendStatus(404);
  }
};

export default { bodySchema, handler };
