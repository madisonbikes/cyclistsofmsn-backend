import { load } from "exifreader";
import { configuration } from "../config";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { updateImageDescription } from "../exiftool";

class FilesystemRepository {
  private baseDirectory;

  constructor() {
    this.baseDirectory = configuration.photosDir;
  }

  /** return list of base paths inside the fs repository. treat these as opaque tokens. */
  async imageFiles() {
    const files = await fs.readdir(this.baseDirectory);
    const filteredFiles = files.filter((value) => {
      const extension = path.parse(value).ext.toLowerCase();
      return [".jpg", ".png"].includes(extension);
    });
    return filteredFiles;
  }

  async tags(baseFilename: string) {
    const path = this.photoPath(baseFilename);
    const fileData = await fs.readFile(path);
    const tags = load(fileData, { expanded: true });
    return tags;
  }

  async metadata(baseFilename: string) {
    const path = this.photoPath(baseFilename);
    const md = await sharp(path).metadata();
    return { width: md.width, height: md.height };
  }

  async timestamp(baseFilename: string) {
    const path = this.photoPath(baseFilename);
    const stat = await fs.stat(path);
    return stat.mtime;
  }

  photoPath(baseFilename: string) {
    return `${this.baseDirectory}/${baseFilename}`;
  }

  async delete(baseFilename: string) {
    try {
      const path = this.photoPath(baseFilename);
      await fs.unlink(path);
    } catch (err) {
      // ignore
      return Promise.resolve();
    }
  }

  async updateImageDescription(baseFilename: string, description: string) {
    const originalFile = this.photoPath(baseFilename);
    return await updateImageDescription(originalFile, description);
  }
}

export const fsRepository = new FilesystemRepository();
