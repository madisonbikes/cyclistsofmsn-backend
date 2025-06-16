import { load } from "exifreader";
import { configuration } from "../config.ts";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { updateImageDescription } from "../exiftool.ts";

function baseDirectory() {
  return configuration.photosDir;
}

/** return list of base paths inside the fs repository. treat these as opaque tokens. */
async function photoFiles() {
  const files = await fs.readdir(baseDirectory());
  const filteredFiles = files.filter((value) => {
    const extension = path.parse(value).ext.toLowerCase();
    return [".jpg", ".png"].includes(extension);
  });
  return filteredFiles;
}

async function tags(baseFilename: string) {
  const path = photoPath(baseFilename);
  const fileData = await fs.readFile(path);
  const tags = load(fileData, { expanded: true });
  return tags;
}

async function metadata(baseFilename: string) {
  const path = photoPath(baseFilename);
  const md = await sharp(path).metadata();
  return { width: md.width, height: md.height };
}

async function timestamp(baseFilename: string) {
  const path = photoPath(baseFilename);
  const stat = await fs.stat(path);
  return stat.mtime;
}

function photoPath(baseFilename: string) {
  return `${baseDirectory()}/${baseFilename}`;
}

async function deletePhoto(baseFilename: string) {
  try {
    const path = photoPath(baseFilename);
    await fs.unlink(path);
  } catch (_err) {
    // ignore
    return Promise.resolve();
  }
}

async function updatePhotoDescription(
  baseFilename: string,
  description: string,
) {
  const originalFile = photoPath(baseFilename);
  return await updateImageDescription(originalFile, description);
}

export default {
  photoFiles,
  photoPath,
  tags,
  metadata,
  timestamp,
  deletePhoto,
  updatePhotoDescription,
};
