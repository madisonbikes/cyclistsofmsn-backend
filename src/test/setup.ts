import "reflect-metadata";
import { ServerConfiguration } from "../config";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  container as rootContainer,
  DependencyContainer,
  injectable,
  Lifecycle,
} from "tsyringe";
import path from "path";
import { Database } from "../database";
import assert from "assert";
import mongoose from "mongoose";
import { PhotoServer } from "../server";
import { Server, TestRequest } from "./request";

let mongoUri: string;
let mongoServer: MongoMemoryServer | undefined;

// the test container is initialized once for the suite
let tc: DependencyContainer | undefined;

export let photoServer: PhotoServer | undefined;
export let runningPhotoServer: Server | undefined;

export type SuiteOptions = {
  // spin up a memory mongodb instance for testing purposes
  withDatabase: boolean;

  // start up a photoserver instance
  withPhotoServer: boolean;

  // clear images after each test
  clearImages: boolean;

  // clear post history after each test
  clearPostHistory: boolean;
};

/** entry point that should be included first in each describe block */
export const setupSuite = (options: Partial<SuiteOptions> = {}): void => {
  beforeAll(async () => {
    assert(tc === undefined);
    tc = await initializeSuite(options);

    await createDatabaseConnection();

    if (options.withPhotoServer) {
      photoServer = tc.resolve(PhotoServer);
      runningPhotoServer = await photoServer.create();
    }
  });

  afterEach(async () => {
    const queries: Array<Promise<unknown>> = [];
    if (options.clearPostHistory) {
      queries.push(mongoose.connection.collection("posts")?.deleteMany({}));
    }
    if (options.clearImages) {
      queries.push(mongoose.connection.collection("images")?.deleteMany({}));
    }
    await Promise.all(queries);
  });

  afterAll(async () => {
    assert(tc);

    await photoServer?.stop();
    photoServer = undefined;

    await clearDatabaseConnection();
    await cleanupSuite();
    tc = undefined;
  });
};

/**
 * Callers that make modifications to the container should do so in a CHILD container because the container is not reset
 * between test
 */
export const testContainer = () => {
  assert(tc);
  return tc;
};

/** return the object managing the connection to the mongodb instance */
export const testDatabase = () => {
  return testContainer().resolve(Database);
};

const initializeSuite = async ({ withDatabase }: Partial<SuiteOptions>) => {
  if (withDatabase) {
    // start the mongo in-memory server on an ephemeral port
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  }

  // don't use value registrations because they will be cleared in the beforeEach() handler
  const testContainer = rootContainer.createChildContainer();

  // provide a custom TestConfiguration adapted for the testing environment
  testContainer.register<ServerConfiguration>(
    ServerConfiguration,
    { useClass: TestConfiguration },
    { lifecycle: Lifecycle.ContainerScoped }
  );
  if (withDatabase) {
    // provide a Database object scoped to the container rather, overriding singleton normally
    testContainer.register<Database>(
      Database,
      { useClass: Database },
      { lifecycle: Lifecycle.ContainerScoped }
    );
  } else {
    // if database not enabled, trigger an error if we try to inject a database object
    testContainer.register<Database>(Database, {
      useFactory: () => {
        throw new Error("No database allowed for this test suite");
      },
    });
  }
  return testContainer;
};

const cleanupSuite = async () => {
  await mongoServer?.stop();
  mongoServer = undefined;
};

@injectable()
class TestConfiguration extends ServerConfiguration {
  public override photosDir: string;
  public override mongodbUri: string;

  constructor() {
    super();

    this.photosDir = path.resolve(__dirname, "../../test_resources");
    // use static mongo URI set in suite initialization
    this.mongodbUri = mongoUri;
  }
}

const clearDatabaseConnection = async () => {
  await testDatabase().stop();
};

const createDatabaseConnection = async () => {
  await testDatabase().start();
};

export const loginTestUser = (request: TestRequest) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testuser", password: "password" })
    .expect(200);
};

export const loginTestAdminUser = (request: TestRequest) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testadmin", password: "password" })
    .expect(200);
};

export const loginTestEditorUser = (request: TestRequest) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testeditor", password: "password" })
    .expect(200);
};
