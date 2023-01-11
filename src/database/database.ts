import { ServerConfiguration } from "../config";
import mongoose, { Mongoose } from "mongoose";
import { Lifecycle, logger } from "../utils";
import { injectable, singleton } from "tsyringe";
import { Version } from "./version";

const CURRENT_DATABASE_VERSION = 1;

/** provide unified access to database connection */
@injectable()
@singleton()
export class Database implements Lifecycle {
  constructor(private configuration: ServerConfiguration) {}

  private connection?: Mongoose;

  async start(): Promise<boolean> {
    if (this.connection) {
      logger.debug(
        { url: this.configuration.mongodbUri },
        `Already connected to MongoDB`
      );
      return false;
    }
    logger.debug(
      { url: this.configuration.mongodbUri },
      `Connecting to MongoDB`
    );

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
    let dbVersion = 0;
    const values = await Version.find();
    if (values.length === 0) {
      logger.info("Database version unset, forcing migration");
    } else if (values.length > 1) {
      throw new Error(
        "Database has multiple versions, cannot proceeed with migration"
      );
    } else {
      dbVersion = values[0].version;
    }

    if (dbVersion !== CURRENT_DATABASE_VERSION) {
      logger.info(
        { oldVersion: dbVersion, currentVersion: CURRENT_DATABASE_VERSION },
        "Migrating database"
      );
      await this.migrateFrom(dbVersion);
    } else {
      logger.debug({ version: dbVersion }, "Database version current");
    }
  }

  private async migrateFrom(version: number) {
    while (version < CURRENT_DATABASE_VERSION) {
      switch (version) {
        case 0:
          // TODO force rescan to extract initial image descriptions
          break;
        default:
          break;
      }
      version++;
    }
    await Version.deleteMany();
    const versionRecord = new Version({ version: CURRENT_DATABASE_VERSION });
    await versionRecord.save();
  }
}
