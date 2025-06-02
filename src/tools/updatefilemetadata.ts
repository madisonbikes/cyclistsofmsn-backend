import { database, Image } from "../database/index.js";
import fsRepository from "../fs_repository/index.js";
import { logger } from "../utils/index.js";
import pLimit from "p-limit";

if (require.main === module) {
  Promise.resolve()
    .then(async () => {
      // connect to the database
      await database.start();

      await updateFileMetadata();

      return database.stop();
    })
    .catch((error: unknown) => {
      console.log(error);
    });
}

export const updateFileMetadata = async () => {
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
        const retval = await fsRepository.updatePhotoDescription(
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
