import { Connection } from "typeorm";
import { Image } from "./entity/Image";
import fs from "fs";
import path from "path";
import { configuration } from "./config";
import { promisify } from "util";

const readdir = promisify(fs.readdir);

export async function scan(connection: Connection): Promise<void> {
  const files = await readdir(configuration.photos_dir);
  const filteredFiles = files.filter((value) => {
    const extension = path.parse(value).ext.toLowerCase();
    return [".jpg", ".png"].includes(extension);
  });
  await handleImages(connection, filteredFiles);
}

async function handleImages(connection: Connection, files: string[]) {
  const repository = connection.getRepository(Image);
  const dbFiles = await repository.find();
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
    console.log(`removing cruft db image ${element.filename}`);
    await repository.delete(element.id);
  }

  // insert new items
  for await (const newItem of filesToAdd) {
    console.log(`adding new image ${newItem}`);
    const newImage = new Image();
    newImage.filename = newItem;
    await repository.insert(newImage);
  }
  console.log("Scan complete");
}
