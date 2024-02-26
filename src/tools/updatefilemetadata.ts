import "reflect-metadata";
import { Database, Image } from "../database";
import { container } from "tsyringe";
import { FilesystemRepository } from "../fs_repository";
import { logger } from "../utils";
import pLimit from "p-limit";

if (require.main === module) {
  Promise.resolve()
    .then(async () => {
      // connect to the database
      const db = container.resolve(Database);
      await db.start();

      const fs = container.resolve(FilesystemRepository);

      await updateFileMetadata(fs);

      return db.stop();
    })
    .catch((error) => {
      console.log(error);
    });
}

export const updateFileMetadata = async (fs: FilesystemRepository) => {
  logger.info("Looking for images with description_from_exif set to false");
  const images = await Image.find();
  logger.info(`Found ${images.length} images`);

  const limit = pLimit(4);

  const promises = images
    .filter((image) => !image.deleted)
    .filter((image) => !image.description_from_exif)
    .filter((image) => image.description != null && image.description !== "")
    .map((image) =>
      limit(async () => {
        const base = image.filename;
        logger.debug(`Updating description for ${base}`);
        const retval = await fs.updateImageDescription(
          base,
          image.description ?? "",
        );
        if (retval.error != null) {
          return retval;
        }
        image.description_from_exif = true;
        await image.save();
        return {};
      }),
    );

  await Promise.all(promises);
  return promises.length;
};
