
import { Image } from "./schema/images.model";
import { ImageDocument } from "./schema/images.types";
import { repository }  from "./fs_repository"
import { Tags } from "exifreader";

export async function scan(): Promise<void> {
  const files = await repository.imageFiles()
  const dbFiles = await Image.find().exec();
  const matchedFiles: ImageDocument[] = [];
  const filesToAdd: string[] = [];

  // bin files into either files that are in db, or are missing
  for (const item of files) {
    const foundElement = dbFiles.find((value) => value.filename === item);
    if(foundElement !== undefined) {
      matchedFiles.push(foundElement);
    } else {
      filesToAdd.push(item);
    }
  }
  // bin db entries into entries that match files, or are cruft
  const dbCruft = dbFiles.filter((item) => {
    const found = files.includes(item.filename);
    return !found;
  });

  // actually remove cruft
  for await (const element of dbCruft) {
    await markImageRemoved(element)
  }

  // insert new items
  for await (const filename of filesToAdd) {
    console.debug(`adding new image ${filename}`);
    const newImage = new Image({ filename: filename });
    newImage.timestamp = await repository.timestamp(filename)
    newImage.exif = await repository.exif(filename)
    await newImage.save();
  }

  for await (const image of matchedFiles) {
    const filename = image.filename

    const newTimestamp = await repository.timestamp(filename)
    if(image.timestamp?.getTime() != newTimestamp.getTime()) {
      console.debug(`updating existing image ${filename}`)
      image.timestamp = newTimestamp
      image.exif = await repository.exif(filename)
      await image.save()
    }

  }
  console.info("Scan complete");
}

async function markImageRemoved(image: ImageDocument) {
  console.debug(`marking cruft db image ${image.filename}`);
  image.deleted = true;
  image.timestamp = null;
  await image.save()
}
