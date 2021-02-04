import { scan } from "./scan";
import { configuration } from "./config";
import mongoose, { Mongoose } from "mongoose";

class Database {
  private connection: Mongoose | undefined;

  async reconnect() {
    await this.disconnect()
    await this.connect()
  }

  async connect() {
    if(this.connection) return
    console.debug(`connecting to mongodb at ${configuration.mongodb_uri}`)
    this.connection = await mongoose.connect(configuration.mongodb_uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    await scan();
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = undefined;
    }
  }
}

export const database = new Database()
