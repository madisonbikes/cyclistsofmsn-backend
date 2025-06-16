import { database, imageModel } from "../database/index.ts";
import fsRepository from "../fs_repository/index.ts";
import { logger } from "../utils/index.ts";
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
  const images = await imageModel.findAll({ filterDeleted: true });
  logger.info(`Found %d images`, images.length);

  let modCount = 0;

  const limit = pLimit(4);

  const promises = images
    .filter((image) => !image.description_from_exif)
    .filter((image) => image.description != null && image.description !== "")
    .map((image) =>
      limit(async () => {
        modCount++;
        const base = image.filename;
        logger.debug("Updating description for %s", base);
        const retval = await fsRepository.updatePhotoDescription(
          base,
          image.description ?? "",
        );
        if (retval.error != null) {
          return retval;
        }
        await imageModel.updateOne(image._id, { description_from_exif: true });
        return {};
      }),
    );

  await Promise.all(promises);
  return modCount;
};
