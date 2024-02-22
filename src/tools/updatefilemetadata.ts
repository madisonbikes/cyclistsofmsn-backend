import "reflect-metadata";
import { Database, Image } from "../database";
import { container } from "tsyringe";
import { FilesystemRepository } from "../fs_repository";
import pLimit from "p-limit";

if (require.main === module) {
  Promise.resolve()
    .then(() => {
      return updateFileMetadata();
    })
    .catch((error) => {
      console.log(error);
    });
}

export const updateFileMetadata = async () => {
  // connect to the database
  const db = container.resolve(Database);
  await db.start();

  const fs = container.resolve(FilesystemRepository);

  console.log("Looking for images with description_from_exif set to true");
  const images = await Image.find({ description_from_exif: { $eq: true } });
  console.log(`Found ${images.length} images`);

  const limit = pLimit(4);

  const promises = images
    .map((image) => {
      const base = image.filename;
      console.log(`Updating description for ${base}`);
      return fs.updateImageDescription(base, image.description ?? "");
    })
    .map((promise) => limit(() => promise));

  await Promise.all(promises);

  await db.stop();
};
