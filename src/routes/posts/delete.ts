import type { Request, Response } from "express";
import { logger } from "../../utils/index.ts";
import { postHistoryModel } from "../../database/database.ts";

async function handler(req: Request, res: Response) {
  const { id } = req.params;
  logger.trace({ id }, "delete single post");

  const result = await postHistoryModel.deleteOne(id);
  if (result.deletedCount === 1) {
    res.sendStatus(200);
  } else {
    // not found
    res.sendStatus(404);
  }
}

export default { handler };
