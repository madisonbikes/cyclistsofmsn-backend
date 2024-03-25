import { Request, Response } from "express";
import { Image, PostHistory } from "../../database";
import { fsRepository } from "../../fs_repository";
import { logger } from "../../utils";
import pLimit from "p-limit";

async function handler(req: Request, res: Response) {
  const id = req.params.id;
  logger.trace({ id }, "delete single image");

  // FIXME we don't really need includeResultMetadata here but it seems to be a bug in the
  // typegoose typings that it is required
  const result = await Image.findOneAndDelete(
    { _id: id },
    { includeResultMetadata: true },
  );
  if (result?.value == null) {
    // not found
    res.sendStatus(404);
    return;
  }
  const { filename } = result.value;
  if (filename != null) {
    const fullPath = fsRepository.photoPath(filename);
    await fsRepository.delete(fullPath);
  }

  const postList = await PostHistory.find({ image: id });

  // remove image from each post but limit to 4 at a time
  // fixme do this using an update query for better performance?
  const limit = pLimit(4);
  await Promise.all(
    postList.map((p) => {
      p.image = undefined;

      return limit(() => p.save());
    }),
  );
  res.sendStatus(200);
}

export default { handler };
