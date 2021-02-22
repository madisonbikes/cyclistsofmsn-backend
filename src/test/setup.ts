import "reflect-metadata";
import { DEFAULT_SERVER_PORT, ServerConfiguration } from "../config";
import axios from "axios";
import winston from "winston";
import { MongoMemoryServer } from "mongodb-memory-server";
import { container as rootContainer, DependencyContainer, injectable, Lifecycle } from "tsyringe";
import path from "path";
import { Database } from "../database";

let mongoUri: string;
let mongoServer: MongoMemoryServer;

// the test container is preconfigured
winston.remove(winston.transports.Console);
winston.remove(winston.transports.File);

axios.defaults.baseURL = `http://localhost:${DEFAULT_SERVER_PORT}`;

let tc: DependencyContainer;

/** entry point that should be included first in each describe block */
export function setupTestContainer(): void {
  beforeAll(async () => {
    tc = await initializeTestContainer();

    const database = tc.resolve(Database);
    await database.connect();
  });

  afterAll(async () => {

    const database = tc.resolve(Database);
    await database.disconnect();

    await cleanupTestContainer();

    tc.reset();
  });

  beforeEach(async () => {
    tc.clearInstances();
  });
}

export function testContainer(): DependencyContainer {
  return tc;
}

async function initializeTestContainer(): Promise<DependencyContainer> {
  mongoServer = new MongoMemoryServer();
  mongoUri = await mongoServer.getUri();

  // don't use value registrations because they will be cleared in the beforeEach() handler
  const testContainer = rootContainer.createChildContainer();
  testContainer.register<ServerConfiguration>(ServerConfiguration,
    { useClass: TestConfiguration },
    { lifecycle: Lifecycle.ContainerScoped });
  testContainer.register<Database>(Database,
    { useClass: Database },
    { lifecycle: Lifecycle.ContainerScoped });
  return testContainer;
}

async function cleanupTestContainer(): Promise<void> {
  await mongoServer.stop();
}

@injectable()
class TestConfiguration extends ServerConfiguration {
  constructor() {
    super();

    this.photosDir = path.resolve(
      __dirname,
      "../../test_resources");
    this.mongodbUri = mongoUri;
  }
}
