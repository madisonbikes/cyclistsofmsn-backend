import { configuration } from "../config";
import exifReader, { IccTags, Tags, XmpTags } from "exifreader";
import fs from "fs/promises";
import path from "path";

const baseDirectory = configuration.photosDir;

/** return list of base paths inside the fs repository. treat these as opaque tokens. */
export async function imageFiles(): Promise<string[]> {
  const files = await fs.readdir(baseDirectory);
  const filteredFiles = files.filter((value) => {
    const extension = path.parse(value).ext.toLowerCase();
    return [".jpg", ".png"].includes(extension);
  });
  return filteredFiles;
}

export async function exif(baseFilename: string): Promise<Tags & IccTags & XmpTags> {
  const path = photoPath(baseFilename);
  const fileData = await fs.readFile(path);
  return exifReader.load(fileData);
}

export async function timestamp(baseFilename: string): Promise<Date> {
  const path = photoPath(baseFilename);
  const stat = await fs.stat(path);
  return stat.mtime;
}

export function photoPath(baseFilename: string): string {
  return `${baseDirectory}/${baseFilename}`;
}