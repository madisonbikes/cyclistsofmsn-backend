import type { Request, Response } from "express";
import { PostHistory } from "../../database/index.js";
import { logger } from "../../utils/index.js";

async function handler(req: Request, res: Response) {
  const { id } = req.params;
  logger.trace({ id }, "delete single post");

  const result = await PostHistory.deleteOne({ _id: id });
  if (result.deletedCount === 1) {
    res.sendStatus(200);
  } else {
    // not found
    res.sendStatus(404);
  }
}

export default { handler };
