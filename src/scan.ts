import { Image, ImageDocument } from "./database";
import { FilesystemRepository } from "./fs_repository";
import { StringArrayTag } from "exifreader";
import parseDate from "date-fns/parse";
import { Lifecycle, logger } from "./utils";
import { injectable } from "tsyringe";

/** expose scanning operation.  requires database connection to be established */
@injectable()
export class ImageRepositoryScanner implements Lifecycle {
  constructor(private fsRepository: FilesystemRepository) {}

  async start(): Promise<void> {
    const [files, dbFiles] = await Promise.all([
      this.fsRepository.imageFiles(),
      Image.find().exec(),
    ]);
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

    // remove cruft
    await Promise.all(dbCruft.map((elem) => this.markFileRemoved(elem)));

    // insert new items
    await Promise.all(filesToAdd.map((filename) => this.addNewFile(filename)));

    // update existing items
    await Promise.all(
      matchedFiles.map((image) => this.updateMatchedFile(image))
    );

    logger.info("Scan complete");
  }

  /** update a matched file */
  private async updateMatchedFile(image: ImageDocument) {
    const filename = image.filename;

    const newTimestamp = await this.fsRepository.timestamp(filename);
    if (image.fs_timestamp?.getTime() !== newTimestamp.getTime()) {
      logger.debug(`updating existing image ${filename}`);
      image.fs_timestamp = newTimestamp;
      const dateTime = (await this.fsRepository.exif(filename))
        .DateTimeOriginal;
      image.exif_createdon = this.parseImageTag(dateTime);
      image.deleted = false;
      await image.save();
    }
  }

  /** insert a newly discovered file */
  private async addNewFile(filename: string) {
    logger.debug(`adding new image ${filename}`);
    const newImage = new Image({ filename: filename });
    newImage.fs_timestamp = await this.fsRepository.timestamp(filename);
    const dateTime = (await this.fsRepository.exif(filename)).DateTimeOriginal;
    newImage.exif_createdon = this.parseImageTag(dateTime);
    await newImage.save();
  }

  /** mark a file removed that used to exist */
  private async markFileRemoved(image: ImageDocument) {
    logger.debug(`marking cruft db image ${image.filename}`);
    image.deleted = true;
    image.fs_timestamp = undefined;
    await image.save();
  }

  private parseImageTag(tag: StringArrayTag | undefined): Date | undefined {
    if (!tag || tag.value.length === 0) {
      return undefined;
    }
    return parseDate(tag?.value[0], "yyyy:MM:dd HH:mm:ss", new Date());
  }
}
