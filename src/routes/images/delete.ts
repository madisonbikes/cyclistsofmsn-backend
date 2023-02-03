import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { Image } from "../../database";
import { FilesystemRepository } from "../../fs_repository";
import { logger } from "../../utils";

@injectable()
export class SingleImageDelete {
  constructor(private repository: FilesystemRepository) {}

  handler = async (req: Request, res: Response) => {
    const id = req.params.id;
    logger.trace({ id }, "delete single post");

    const result = await Image.findOneAndDelete({ _id: id });
    if (result != null) {
      const shortName = result?.filename;
      if (shortName != null) {
        const filename = this.repository.photoPath(shortName);
        await this.repository.delete(filename);
      }
      res.sendStatus(200);
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
