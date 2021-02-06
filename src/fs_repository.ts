import { configuration } from "./config";
import exifReader, { IccTags, Tags, XmpTags } from "exifreader";
import fs from "fs/promises";
import path from "path";

class FilesystemRepository {
  private readonly baseDirectory: string;

  constructor(baseDirectory: string) {
    this.baseDirectory = baseDirectory;
  }

  async imageFiles(): Promise<string[]> {
    const files = await fs.readdir(this.baseDirectory);
    const filteredFiles = files.filter((value) => {
      const extension = path.parse(value).ext.toLowerCase();
      return [".jpg", ".png"].includes(extension);
    });
    return filteredFiles;
  }

  async exif(baseFilename: string): Promise<Tags & IccTags & XmpTags> {
    const path = this.photoPath(baseFilename);
    const fileData = await fs.readFile(path);
    const retval = exifReader.load(fileData);
    delete retval.MakerNote
    delete retval["Thumbnail"]
    return retval;
  }

  async timestamp(baseFilename: string): Promise<Date> {
    const path = this.photoPath(baseFilename);
    const stat = await fs.stat(path);
    return stat.mtime;
  }

  photoPath(baseFilename: string): string {
    return `${this.baseDirectory}/${baseFilename}`;
  }
}


export const repository = new FilesystemRepository(configuration.photos_dir);