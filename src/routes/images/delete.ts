import type { Request, Response } from "express";
import fsRepository from "../../fs_repository/index.ts";
import { logger } from "../../utils/index.ts";
import { imageModel, postHistoryModel } from "../../database/database.ts";

async function handler(req: Request, res: Response) {
  const id = req.params.id;
  logger.trace({ id }, "delete single image");

  const result = await imageModel.findByIdAndDelete(id);
  if (result == null) {
    // not found
    res.sendStatus(404);
    return;
  }
  const { filename } = result;
  const fullPath = fsRepository.photoPath(filename);
  await fsRepository.deletePhoto(fullPath);

  await postHistoryModel.clearImageRefs(id);

  res.sendStatus(200);
}

export default { handler };
