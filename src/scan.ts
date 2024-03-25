import { database, Image, ImageDocument } from "./database";
import { fsRepository } from "./fs_repository";
import { StringArrayTag } from "exifreader";
import { parse } from "date-fns/parse";
import { Lifecycle, logger } from "./utils";
import pLimit from "p-limit";

/** expose scanning operation.  requires database connection to be established */
class ImageRepositoryScanner implements Lifecycle {
  start() {
    return this.scan();
  }

  async scan() {
    const [files, dbFiles] = await Promise.all([
      fsRepository.imageFiles(),
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

    const limit = pLimit(4);

    const array: Promise<unknown>[] = [];

    // remove cruft
    array.push(
      ...dbCruft.map((elem) => limit(() => this.markFileRemoved(elem))),
    );

    // insert new items
    array.push(
      ...filesToAdd.map((filename) => limit(() => this.addNewFile(filename))),
    );

    // update existing items
    array.push(
      ...matchedFiles.map((image) =>
        limit(() => this.updateMatchedFile(image)),
      ),
    );

    await Promise.all(array);

    logger.info("Scan complete");
  }

  /** update a matched file */
  private async updateMatchedFile(image: ImageDocument) {
    const filename = image.filename;

    const newTimestamp = await fsRepository.timestamp(filename);
    if (
      image.fs_timestamp?.getTime() !== newTimestamp.getTime() ||
      database.refreshAllMetadata
    ) {
      logger.debug(`updating existing image ${filename}`);
      const metadata = await this.getFileMetadata(filename);
      Object.assign(image, metadata);
      image.deleted = false;
      await image.save();
    }
  }

  /** insert a newly discovered file */
  private async addNewFile(filename: string) {
    logger.debug(`adding new image ${filename}`);
    const metadata = await this.getFileMetadata(filename);
    const newImage = new Image({
      filename,
      ...metadata,
    });
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
    tag: StringArrayTag | undefined,
  ): Date | undefined {
    if (!tag || tag.value.length === 0) {
      return undefined;
    }
    return parse(tag.value[0], "yyyy:MM:dd HH:mm:ss", new Date());
  }

  private parseStringTag(tag: StringArrayTag | undefined): string | undefined {
    if (!tag || tag.value.length === 0) {
      return undefined;
    }
    return tag.value[0];
  }

  private async getFileMetadata(filename: string) {
    const [fs_timestamp, tags, metadata] = await Promise.all([
      fsRepository.timestamp(filename),
      fsRepository.tags(filename),
      fsRepository.metadata(filename),
    ]);
    const description = this.parseStringTag(tags?.exif?.ImageDescription);
    const exif_createdon = this.parseImageDateTimeTag(tags?.exif?.DateTime);
    const width = metadata?.width;
    const height = metadata?.height;

    const retval: Partial<ImageDocument> = {
      fs_timestamp,
      exif_createdon,
      description,
      width,
      height,
    };
    return retval;
  }
}

// singleton hack instead of DI because it's used by other components
export const imageRepositoryScanner = new ImageRepositoryScanner();
