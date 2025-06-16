import type { Request, Response } from "express";
import { logger } from "../../utils/index.js";
import {
  type Post,
  type PutPostBody,
  putPostBodySchema,
} from "../contract/index.js";
import { mapPostSchema } from "./types.js";
import { postHistoryModel } from "../../database/database.js";

const bodySchema = putPostBodySchema;

const handler = async (req: Request, res: Response) => {
  const body = req.validated as PutPostBody;

  const { id } = req.params;
  logger.trace({ id, body }, "put single post");

  const result = await postHistoryModel.updateOne(id, body, {
    returnDocument: "after",
  });
  if (result != null) {
    res.send(mapPostSchema(result) satisfies Post);
  } else {
    // not found
    res.sendStatus(404);
  }
};

export default { bodySchema, handler };
