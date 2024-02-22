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

      return updateFileMetadata();

      await db.stop();
    })
    .catch((error) => {
      console.log(error);
    });
}

export const updateFileMetadata = async () => {
  const fs = container.resolve(FilesystemRepository);

  logger.info("Looking for images with description_from_exif set to false");
  const images = await Image.find({ description_from_exif: { $eq: false } });
  logger.info(`Found ${images.length} images`);

  const limit = pLimit(4);

  const promises = images
    .map(async (image) => {
      const base = image.filename;
      logger.info(`Updating description for ${base}`);
      await fs.updateImageDescription(base, image.description ?? "");
      image.description_from_exif = true;
      return image.save();
    })
    .map((promise) => limit(() => promise));

  await Promise.all(promises);
  return promises.length;
};
