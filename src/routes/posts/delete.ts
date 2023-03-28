import { Request, Response } from "express";
import { PostHistory } from "../../database";
import { logger } from "../../utils";

export const handler = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.trace({ id }, "delete single post");

  const result = await PostHistory.deleteOne({ _id: id });
  if (result != null && result.deletedCount === 1) {
    res.sendStatus(200);
  } else {
    // not found
    res.sendStatus(404);
  }
};
