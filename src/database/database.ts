import { configuration } from "../config";
import mongoose, { Mongoose } from "mongoose";
import { logger } from "../utils";
import { Version } from "./version";
import { Image } from "./images";

/** make sure you update switch statement below when bumping db version */
const CURRENT_DATABASE_VERSION = 3;

/** provide unified access to database connection */

let connection: Mongoose | undefined;

/** set to true if db version change should force a rescan of all existing files */
let _refreshAllMetadata = false;

function refreshAllMetadata() {
  return _refreshAllMetadata;
}

function collection(name: string) {
  if (connection === undefined) {
    throw new Error("not connected to mongodb");
  }
  return connection.connection.collection(name);
}

async function start(): Promise<boolean> {
  const uri = configuration.mongodbUri;
  if (connection) {
    logger.debug({ url: uri }, `Already connected to MongoDB`);
    return false;
  }
  logger.info(`Connecting to MongoDB on ${uri}`);

  // this is the default value from mongoose 7 forward, be explicit to avoid deprecation notice
  mongoose.set("strictQuery", false);

  connection = await mongoose.connect(uri);
  await versionCheck();
  return true;
}

async function stop(): Promise<void> {
  if (connection) {
    await connection.disconnect();
    connection = undefined;
  }
}

/** checks if database is at current version and if not, upgrades it */
async function versionCheck() {
  const values = await Version.find();
  if (values.length > 1) {
    throw new Error(
      "Database has multiple versions, cannot proceeed with migration",
    );
  }

  if (values.length === 0) {
    logger.info(`Initializing database version to ${CURRENT_DATABASE_VERSION}`);
    await setCurrentVersion();
  } else {
    let version = values[0].version;
    if (version === CURRENT_DATABASE_VERSION) {
      logger.debug("Database version is current");
    } else {
      logger.info(
        { oldVersion: version, currentVersion: CURRENT_DATABASE_VERSION },
        "Migrating database",
      );

      while (version < CURRENT_DATABASE_VERSION) {
        switch (version) {
          case 1: {
            // add the image hidden column
            await Image.updateMany(
              { hidden: { $exists: false } },
              { $set: { hidden: false } },
            );
            break;
          }
          case 2: {
            // force refresh to add image dimension metadata to the images
            triggerMetadataRefresh();
            break;
          }
          default:
            break;
        }
        version++;
      }
      await setCurrentVersion();
    }
  }
}

function triggerMetadataRefresh() {
  if (!_refreshAllMetadata) {
    logger.info("Forcing refresh of all metadata due to database upgrade");
    _refreshAllMetadata = true;
  }
}

async function setCurrentVersion() {
  await Version.deleteMany();
  const versionRecord = new Version({ version: CURRENT_DATABASE_VERSION });
  await versionRecord.save();
}

export const database = { start, stop, collection, refreshAllMetadata };
