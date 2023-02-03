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
    logger.trace({ id }, "delete single image");

    const result = await Image.findOneAndDelete({ _id: id });
    if (result != null) {
      const { filename } = result;
      if (filename != null) {
        const fullPath = this.repository.photoPath(filename);
        await this.repository.delete(fullPath);
      }
      res.sendStatus(200);
    } else {
      // not found
      res.sendStatus(404);
    }
  };
}
