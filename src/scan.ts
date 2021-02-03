import fs from "fs";
import path from "path";
import { configuration } from "./config";
import { promisify } from "util";
import { Image } from "./schema/images.model";

const readdir = promisify(fs.readdir);

export async function scan(): Promise<void> {
  const files = await readdir(configuration.photos_dir);
  const filteredFiles = files.filter((value) => {
    const extension = path.parse(value).ext.toLowerCase();
    return [".jpg", ".png"].includes(extension);
  });
  await handleImages(filteredFiles);
}

async function handleImages(files: string[]) {

  const dbFiles = await Image.find().exec();
  const matchedFiles: string[] = [];
  const filesToAdd: string[] = [];

  // bin files into either files that are in db, or are missing
  for (const item of files) {
    if (dbFiles.find((value) => value.filename === item)) {
      matchedFiles.push(item);
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
    console.debug(`removing cruft db image ${element.filename}`);
    await Image.deleteOne({ _id: element.id });
  }

  // insert new items
  for await (const newItem of filesToAdd) {
    console.debug(`adding new image ${newItem}`);
    const newImage = new Image({ filename: newItem })
    await newImage.save();
  }
  console.info("Scan complete");
}
