import { ServerConfiguration } from "../config";
import mongoose, { Mongoose } from "mongoose";
import { logger } from "../utils/logger";
import { injectable } from "tsyringe";

/** provide unified access to database connection */
@injectable()
export class Database {
  constructor(private configuration: ServerConfiguration) {}

  private connection?: Mongoose;

  async reconnect() {
    await this.disconnect();
    await this.connect();
  }

  async connect(): Promise<boolean> {
    if (this.connection) {
      logger.debug(
        `already connected to mongodb at ${this.configuration.mongodbUri}`
      );
      return false;
    }
    logger.debug(`connecting to mongodb at ${this.configuration.mongodbUri}`);
    this.connection = await mongoose.connect(this.configuration.mongodbUri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    return true;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = undefined;
    }
  }
}
