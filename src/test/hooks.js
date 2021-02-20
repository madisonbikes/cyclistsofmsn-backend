import "reflect-metadata";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongoServer;

// noinspection JSUnusedGlobalSymbols
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function mochaGlobalSetup() {
  mongoServer = new MongoMemoryServer({instance: { dbName: "test", port: 52333 }});
  await mongoServer.start()
  const url = await mongoServer.getUri()
  console.log(url)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function mochaGlobalTeardown() {
  await mongoServer.stop()
}