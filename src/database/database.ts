import { ServerConfiguration } from "../config";
import mongoose, { Mongoose } from "mongoose";
import { Lifecycle, logger } from "../utils";
import { injectable, singleton } from "tsyringe";

/** provide unified access to database connection */
@injectable()
@singleton()
export class Database implements Lifecycle {
  constructor(private configuration: ServerConfiguration) {}

  private connection?: Mongoose;

  async start(): Promise<boolean> {
    if (this.connection) {
      logger.debug(
        `already connected to mongodb at ${this.configuration.mongodbUri}`
      );
      return false;
    }
    logger.debug(`connecting to mongodb at ${this.configuration.mongodbUri}`);

    // this is the default value from mongoose 7 forward, be explicit to avoid deprecation notice
    mongoose.set("strictQuery", false);

    this.connection = await mongoose.connect(this.configuration.mongodbUri);
    return true;
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = undefined;
    }
  }
}
