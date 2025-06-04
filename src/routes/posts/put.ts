import { Request, Response } from "express";
import { PostHistory } from "../../database";
import { logger } from "../../utils";
import { Post, PutPostBody, putPostBodySchema } from "../contract";
import { mapPostSchema } from "./types";

const bodySchema = putPostBodySchema;

const handler = async (req: Request, res: Response) => {
  const body = req.validated as PutPostBody;

  const { id } = req.params;
  logger.trace({ id, body }, "put single post");

  const result = await PostHistory.findByIdAndUpdate(id, body, { new: true });
  if (result != null) {
    res.send(mapPostSchema(result) satisfies Post);
  } else {
    // not found
    res.sendStatus(404);
  }
};

export default { bodySchema, handler };
