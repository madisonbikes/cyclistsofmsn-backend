import { Collection } from "mongodb";
import { logger } from "../utils/logger";
import { type DbVersion } from "./types";
import { type ImageModelCollectionType } from "./images";

/** make sure you update switch statement below when bumping db version */
const CURRENT_DATABASE_VERSION = 3;

export type VersionModelCollectionType = Collection<Omit<DbVersion, "_id">>;

type VersionCheckResult = {
  needsMetadataRefresh: boolean;
};

/**
 * Holds a single row (when working correctly) that ID's the version of data in this database.
 * Used to allow for rescans of image metadata or other migration, when necessary.
 */
export class VersionsModel {
  private collection: VersionModelCollectionType;
  private imagesCollection: ImageModelCollectionType;

  constructor(
    collection: VersionModelCollectionType,
    imagesCollection: ImageModelCollectionType,
  ) {
    this.collection = collection;
    this.imagesCollection = imagesCollection;
  }

  findAll() {
    return this.collection.find().toArray();
  }

  async setCurrentVersion(version: DbVersion) {
    // clear any existing versions
    await this.collection.deleteMany({});
    return this.collection.insertOne(version);
  }

  /** checks if database is at current version and if not, upgrades it */
  async versionCheck(): Promise<VersionCheckResult> {
    let needsMetadataRefresh = false;
    const values = await this.findAll();
    if (values.length > 1) {
      throw new Error(
        "Database has multiple versions, cannot proceeed with migration",
      );
    }

    if (values.length === 0) {
      logger.info(
        `Initializing database version to ${CURRENT_DATABASE_VERSION}`,
      );
      await this.setCurrentVersion({ version: CURRENT_DATABASE_VERSION });
    } else {
      let version = values[0].version;
      if (version === CURRENT_DATABASE_VERSION) {
        logger.debug("Database version is current");
      } else {
        logger.info(
          { oldVersion: version, CURRENT_DATABASE_VERSION },
          "Migrating database",
        );

        while (version < CURRENT_DATABASE_VERSION) {
          switch (version) {
            case 1: {
              // add the image hidden column
              await this.imagesCollection.updateMany(
                { hidden: { $exists: false } },
                { $set: { hidden: false } },
              );
              break;
            }
            case 2: {
              // force refresh to add image dimension metadata to the images
              needsMetadataRefresh = true;
              break;
            }
            default:
              break;
          }
          version++;
        }
        await this.setCurrentVersion({ version: CURRENT_DATABASE_VERSION });
      }
    }
    return {
      needsMetadataRefresh,
    };
  }
}
