import { ServerConfiguration } from "../config";
import mongoose, { Mongoose } from "mongoose";
import { Lifecycle, logger } from "../utils";
import { injectable, singleton } from "tsyringe";
import { Version } from "./version";
import { Image } from "./images";

/** make sure you update switch statement below when bumping db version */
const CURRENT_DATABASE_VERSION = 3;

/** provide unified access to database connection */
@injectable()
@singleton()
export class Database implements Lifecycle {
  constructor(private configuration: ServerConfiguration) {}

  private connection?: Mongoose;

  /** set to true if db version change should force a rescan of all existing files */
  private _refreshAllMetadata = false;
  public get refreshAllMetadata() {
    return this._refreshAllMetadata;
  }

  collection(name: string) {
    if (this.connection === undefined) {
      throw new Error("not connected to mongodb");
    }
    return this.connection.connection.collection(name);
  }

  async start(): Promise<boolean> {
    if (this.connection) {
      logger.debug(
        { url: this.configuration.mongodbUri },
        `Already connected to MongoDB`,
      );
      return false;
    }
    logger.info(`Connecting to MongoDB on ${this.configuration.mongodbUri}`);

    // this is the default value from mongoose 7 forward, be explicit to avoid deprecation notice
    mongoose.set("strictQuery", false);

    this.connection = await mongoose.connect(this.configuration.mongodbUri);
    await this.versionCheck();
    return true;
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = undefined;
    }
  }

  /** checks if database is at current version and if not, upgrades it */
  private async versionCheck() {
    const values = await Version.find();
    if (values.length > 1) {
      throw new Error(
        "Database has multiple versions, cannot proceeed with migration",
      );
    }

    if (values.length === 0) {
      logger.info(
        `Initializing database version to ${CURRENT_DATABASE_VERSION}`,
      );
      await this.setCurrentVersion();
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
              this.triggerMetadataRefresh();
              break;
            }
            default:
              break;
          }
          version++;
        }
        await this.setCurrentVersion();
      }
    }
  }

  private triggerMetadataRefresh() {
    if (!this._refreshAllMetadata) {
      logger.info("Forcing refresh of all metadata due to database upgrade");
      this._refreshAllMetadata = true;
    }
  }

  private async setCurrentVersion() {
    await Version.deleteMany();
    const versionRecord = new Version({ version: CURRENT_DATABASE_VERSION });
    await versionRecord.save();
  }
}
