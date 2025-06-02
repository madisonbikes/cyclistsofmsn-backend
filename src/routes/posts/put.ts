import type { Request, Response } from "express";
import { PostHistory } from "../../database/index.js";
import { logger } from "../../utils/index.js";
import { type PutPostBody, putPostBodySchema } from "../contract/index.js";
import { mapPostSchema } from "./types.js";

const bodySchema = putPostBodySchema;

const handler = async (req: Request, res: Response) => {
  const body = req.validated as PutPostBody;

  const { id } = req.params;
  logger.trace({ id, body }, "put single post");

  const result = await PostHistory.findByIdAndUpdate(id, body, { new: true });
  if (result != null) {
    res.send(mapPostSchema.parse(result));
  } else {
    // not found
    res.sendStatus(404);
  }
};

export default { bodySchema, handler };
