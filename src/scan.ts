import { database, imageModel } from "./database";
import fsRepository from "./fs_repository";
import { type StringArrayTag } from "exifreader";
import { parse } from "date-fns/parse";
import { logger } from "./utils";
import pLimit from "p-limit";
import { type DbImage } from "./database/types";

/** expose scanning operation.  requires database connection to be established */
function start() {
  return scan();
}

async function scan() {
  const [files, dbFiles] = await Promise.all([
    fsRepository.photoFiles(),
    imageModel.findAll(),
  ]);
  const matchedFiles: DbImage[] = [];
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
  array.push(...dbCruft.map((elem) => limit(() => markFileRemoved(elem))));

  // insert new items
  array.push(
    ...filesToAdd.map((filename) => limit(() => addNewFile(filename))),
  );

  // update existing items
  array.push(
    ...matchedFiles.map((image) => limit(() => updateMatchedFile(image))),
  );

  await Promise.all(array);

  logger.info("Scan complete");
}

/** update a matched file */
async function updateMatchedFile(image: DbImage) {
  const filename = image.filename;

  const newTimestamp = await fsRepository.timestamp(filename);
  if (
    image.fs_timestamp?.getTime() !== newTimestamp.getTime() ||
    database.refreshAllMetadata
  ) {
    logger.debug("updating existing image %s", filename);
    const metadata = await getFileMetadata(filename);
    return imageModel.updateOne(image._id, { ...metadata, deleted: false });
  } else {
    // no changes, nothing to do
    return Promise.resolve();
  }
}

/** insert a newly discovered file */
async function addNewFile(filename: string) {
  logger.trace("adding new image %s", filename);
  const metadata = await getFileMetadata(filename);
  await imageModel.insertOne({
    filename,
    ...metadata,
  });
}

/** mark a file removed that used to exist */
function markFileRemoved(image: DbImage) {
  logger.debug("marking cruft db image %s", image.filename);

  return imageModel.updateOne(image._id, {
    deleted: true,
    fs_timestamp: undefined,
  });
}

function parseImageDateTimeTag(
  tag: StringArrayTag | undefined,
): Date | undefined {
  if (!tag || tag.value.length === 0) {
    return undefined;
  }
  return parse(tag.value[0], "yyyy:MM:dd HH:mm:ss", new Date());
}

function parseStringTag(tag: StringArrayTag | undefined): string | undefined {
  if (!tag || tag.value.length === 0) {
    return undefined;
  }
  return tag.value[0];
}

async function getFileMetadata(filename: string) {
  const [fs_timestamp, tags, metadata] = await Promise.all([
    fsRepository.timestamp(filename),
    fsRepository.tags(filename),
    fsRepository.metadata(filename),
  ]);
  const description = parseStringTag(tags.exif?.ImageDescription);
  const exif_createdon = parseImageDateTimeTag(tags.exif?.DateTime);
  const width = metadata.width;
  const height = metadata.height;

  const retval: Partial<DbImage> = {
    fs_timestamp,
    exif_createdon,
    description,
    width,
    height,
  };
  return retval;
}

export default { start, scan };
