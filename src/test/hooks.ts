import "reflect-metadata";
import { configuration } from "../config";
import path from "path";
import axios from "axios";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// noinspection JSUnusedGlobalSymbols
export const mochaHooks = {
  async beforeAll(): Promise<void> {
    configuration.photosDir = path.resolve(__dirname, "../../test_resources");
    axios.defaults.baseURL = `http://localhost:${configuration.serverPort}`;

    mongoServer = new MongoMemoryServer();
    configuration.mongodbUri = await mongoServer.getUri();
  },
  async afterAll(): Promise<void> {
    await mongoServer.stop();
  }
};