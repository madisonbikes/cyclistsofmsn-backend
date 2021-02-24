import "reflect-metadata";
import { DEFAULT_SERVER_PORT, ServerConfiguration } from "../config";
import axios from "axios";
import winston from "winston";
import { MongoMemoryServer } from "mongodb-memory-server";
import { container as rootContainer, DependencyContainer, injectable, Lifecycle } from "tsyringe";
import path from "path";
import { Database } from "../database";
import assert from "assert";

// no logging for test
winston.remove(winston.transports.Console);
winston.remove(winston.transports.File);

// preset axios
// FIXME get rid of axios and use supertest
axios.defaults.baseURL = `http://localhost:${DEFAULT_SERVER_PORT}`;

let mongoUri: string;
let mongoServer: MongoMemoryServer | undefined;

// the test container is initialized once for the suite
let tc: DependencyContainer | undefined;

export type SuiteOptions = {
  // spin up a memory mongodb instance for testing purposes
  withDatabase: boolean
}

/** entry point that should be included first in each describe block */
export function setupSuite(options: Partial<SuiteOptions> = {}): void {
  beforeAll(async () => {
    assert(tc == undefined);
    tc = await initializeSuite(options);

    await createDatabaseConnection();
  });

  afterAll(async () => {
    assert(tc);

    await clearDatabaseConnection();
    await cleanupSuite();
    tc = undefined;
  });
}

/**
 * Callers that make modifications to the container should do so in a CHILD container because the container is not reset
 * between test
 */
export function testContainer(): DependencyContainer {
  assert(tc);
  return tc;
}

/** return the object managing the connection to the mongodb instance */
export function testDatabase(): Database {
  return testContainer().resolve(Database);
}

async function initializeSuite(options: Partial<SuiteOptions>): Promise<DependencyContainer> {
  const withDatabase = options.withDatabase;
  if (withDatabase) {
    // start the mongo in-memory server on an ephemeral port
    mongoServer = new MongoMemoryServer();
    mongoUri = await mongoServer.getUri();
  }

  // don't use value registrations because they will be cleared in the beforeEach() handler
  const testContainer = rootContainer.createChildContainer();

  // provide a custom TestConfiguration adapted for the testing environment
  testContainer.register<ServerConfiguration>(ServerConfiguration,
    { useClass: TestConfiguration },
    { lifecycle: Lifecycle.ContainerScoped });
  if (withDatabase) {
    // provide a Database object scoped to the container rather, overriding singleton normally
    testContainer.register<Database>(Database,
      { useClass: Database },
      { lifecycle: Lifecycle.ContainerScoped });
  } else {
    // if database not enabled, trigger an error if we try to inject a database object
    testContainer.register<Database>(Database,
      {
        useFactory: () => {
          throw new Error("No database allowed for this test suite");
        }
      });
  }
  return testContainer;
}

async function cleanupSuite(): Promise<void> {
  await mongoServer?.stop();
  mongoServer = undefined;
}

@injectable()
class TestConfiguration extends ServerConfiguration {
  constructor() {
    super();

    this.photosDir = path.resolve(
      __dirname,
      "../../test_resources");
    // use static mongo URI set in suite initialization
    this.mongodbUri = mongoUri;
  }
}

async function clearDatabaseConnection() {
  await testDatabase().stop();
}

async function createDatabaseConnection() {
  await testDatabase().start();
}



