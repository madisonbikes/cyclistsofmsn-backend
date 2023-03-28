import { Request, Response } from "express";
import { PostHistory } from "../../database";
import { logger } from "../../utils";
import { PutPostBody, putPostBodySchema } from "../contract";
import { mapPostSchema } from "./types";

export const bodySchema = putPostBodySchema;

export const handler = async (req: Request, res: Response) => {
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
