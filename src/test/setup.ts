import "reflect-metadata";
import { DEFAULT_SERVER_PORT, ServerConfiguration } from "../config";
import axios from "axios";
import winston from "winston";
import { MongoMemoryServer } from "mongodb-memory-server";
import { container as rootContainer, DependencyContainer, injectable, Lifecycle, scoped } from "tsyringe";
import path from "path";

let mongoUri: string;
let mongoServer: MongoMemoryServer;

// the test container is preconfigured
winston.remove(winston.transports.Console);
winston.remove(winston.transports.File);

axios.defaults.baseURL = `http://localhost:${DEFAULT_SERVER_PORT}`;

async function initializeTestContainer(): Promise<DependencyContainer> {
  mongoServer = new MongoMemoryServer();
  mongoUri = await mongoServer.getUri();
  const testContainer = rootContainer.createChildContainer();
  testContainer.register<ServerConfiguration>(ServerConfiguration, { useClass: TestConfiguration });
  return testContainer;
}

async function cleanupTestContainer(): Promise<void> {
  await mongoServer.stop();
}

let tc: DependencyContainer;

export function setupTestContainer(): void {
  beforeAll(async () => {
    tc = await initializeTestContainer();
  });

  afterAll(async () => {
    await cleanupTestContainer();
  });

  beforeEach(() => {
    tc.clearInstances();
  });
}

export function testContainer(): DependencyContainer {
  return tc;
}

@injectable()
@scoped(Lifecycle.ResolutionScoped)
class TestConfiguration extends ServerConfiguration {
  constructor() {
    super();

    this.photosDir = path.resolve(
      __dirname,
      "../../test_resources");
    this.mongodbUri = mongoUri;
  }
}
