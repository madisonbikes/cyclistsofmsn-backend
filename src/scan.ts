import { Database, Image, ImageClass, ImageDocument } from "./database";
import { FilesystemRepository } from "./fs_repository";
import { StringArrayTag } from "exifreader";
import parseDate from "date-fns/parse";
import { Lifecycle, logger } from "./utils";
import { injectable } from "tsyringe";

/** expose scanning operation.  requires database connection to be established */
@injectable()
export class ImageRepositoryScanner implements Lifecycle {
  constructor(
    private fsRepository: FilesystemRepository,
    private database: Database
  ) {}

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
    if (
      image.fs_timestamp?.getTime() !== newTimestamp.getTime() ||
      this.database.refreshAllMetadata
    ) {
      logger.debug(`updating existing image ${filename}`);

      const metadata = await this.getFileMetadata(filename);

      if (!image.description_from_exif) {
        delete metadata.description;
      }
      Object.assign(image, metadata);
      image.deleted = false;
      await image.save();
    }
  }

  /** insert a newly discovered file */
  private async addNewFile(filename: string) {
    logger.debug(`adding new image ${filename}`);
    const metadata = await this.getFileMetadata(filename);
    const newImage = new Image({ filename, ...metadata });
    if (newImage.description !== undefined) {
      newImage.description_from_exif = true;
    }
    logger.trace(newImage, "image data");
    await newImage.save();
  }

  /** mark a file removed that used to exist */
  private async markFileRemoved(image: ImageDocument) {
    logger.debug(`marking cruft db image ${image.filename}`);
    image.deleted = true;
    image.fs_timestamp = undefined;
    await image.save();
  }

  private parseImageDateTimeTag(
    tag: StringArrayTag | undefined
  ): Date | undefined {
    if (!tag || tag.value.length === 0) {
      return undefined;
    }
    return parseDate(tag?.value[0], "yyyy:MM:dd HH:mm:ss", new Date());
  }

  private parseStringTag(tag: StringArrayTag | undefined): string | undefined {
    if (!tag || tag.value.length === 0) {
      return undefined;
    }
    return tag?.value[0];
  }

  private getFileMetadata = async (filename: string) => {
    const [
      fs_timestamp,
      { DateTimeOriginal: rawCreatedOn, ImageDescription: rawDescription },
    ] = await Promise.all([
      this.fsRepository.timestamp(filename),
      this.fsRepository.exif(filename),
    ]);
    const description = this.parseStringTag(rawDescription);
    const exif_createdon = this.parseImageDateTimeTag(rawCreatedOn);

    const retval: Partial<ImageClass> = {
      fs_timestamp,
      exif_createdon,
      description,
    };
    return retval;
  };
}
