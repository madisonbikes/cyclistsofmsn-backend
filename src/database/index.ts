import { configuration } from "../config";
import mongoose, { Mongoose } from "mongoose";

/** provide unified access to database connection */
class Database {
  private connection?: Mongoose;

  async reconnect() {
    await this.disconnect()
    await this.connect()
  }

  async connect() {
    if(this.connection) {
      console.debug(`already connected to mongodb at ${configuration.mongodbUri}`)
      return
    }
    console.debug(`connecting to mongodb at ${configuration.mongodbUri}`)
    this.connection = await mongoose.connect(configuration.mongodbUri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = undefined;
    }
  }
}

export const database = new Database()
