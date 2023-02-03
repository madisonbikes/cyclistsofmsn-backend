import { ServerConfiguration } from "../config";
import { IccTags, Tags, XmpTags, load } from "exifreader";
import fs from "fs/promises";
import path from "path";
import { injectable } from "tsyringe";

@injectable()
export class FilesystemRepository {
  constructor(private configuration: ServerConfiguration) {}

  private baseDirectory() {
    return this.configuration.photosDir;
  }

  /** return list of base paths inside the fs repository. treat these as opaque tokens. */
  async imageFiles() {
    const files = await fs.readdir(this.baseDirectory());
    const filteredFiles = files.filter((value) => {
      const extension = path.parse(value).ext.toLowerCase();
      return [".jpg", ".png"].includes(extension);
    });
    return filteredFiles;
  }

  async exif(baseFilename: string): Promise<Tags & IccTags & XmpTags> {
    const path = this.photoPath(baseFilename);
    const fileData = await fs.readFile(path);
    return load(fileData);
  }

  async timestamp(baseFilename: string) {
    const path = this.photoPath(baseFilename);
    const stat = await fs.stat(path);
    return stat.mtime;
  }

  photoPath(baseFilename: string) {
    return `${this.baseDirectory()}/${baseFilename}`;
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
}
