import { Image } from "./database/images.model";
import { ImageDocument } from "./database/images.types";
import { repository } from "./fs_repository";

/** expose scanning operation.  requires database connection to be established */
export async function scan(): Promise<void> {
  const repo = repository()
  const files = await repo.imageFiles();
  const dbFiles = await Image.find().exec();
  const matchedFiles: ImageDocument[] = [];
  const filesToAdd: string[] = [];

  // bin files into either files that are in db, or are missing
  for (const item of files) {
    const foundElement = dbFiles.find((value) => value.filename === item);
    if (foundElement !== undefined) {
      matchedFiles.push(foundElement);
    } else {
      filesToAdd.push(item);
    }
  }
  // bin db entries into entries that match files, or are cruft
  const dbCruft = dbFiles.filter((item) => {
    const found = files.includes(item.filename);
    return !found && !item.deleted;
  });

  // actually remove cruft
  for await (const element of dbCruft) {
    await markImageRemoved(element);
  }

  // insert new items
  for await (const filename of filesToAdd) {
    console.debug(`adding new image ${filename}`);
    const newImage = new Image({ filename: filename });
    newImage.timestamp = await repo.timestamp(filename);
    newImage.exif = await repo.exif(filename);
    await newImage.save();
  }

  for await (const image of matchedFiles) {
    const filename = image.filename;

    const newTimestamp = await repo.timestamp(filename);
    if (image.timestamp?.getTime() !== newTimestamp.getTime()) {
      console.debug(`updating existing image ${filename}`);
      image.timestamp = newTimestamp;
      image.exif = await repo.exif(filename);
      await image.save();
    }

  }
  console.info("Scan complete");
}

async function markImageRemoved(image: ImageDocument) {
  console.debug(`marking cruft db image ${image.filename}`);
  image.deleted = true;
  image.timestamp = undefined;
  await image.save();
}
