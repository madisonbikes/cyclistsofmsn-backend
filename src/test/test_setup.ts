import { configuration } from "../config";
import path from "path";
import axios from "axios";
import { MongoMemoryServer } from "mongodb-memory-server";

configuration.photosDir = path.resolve(__dirname, "../../test_resources");
axios.defaults.baseURL = `http://localhost:${configuration.serverPort}`;

let mongoServer: MongoMemoryServer;

before(async () => {
  mongoServer = new MongoMemoryServer();
  configuration.mongodbUri = await mongoServer.getUri();
});

after(async () => {
  await mongoServer.stop();
});