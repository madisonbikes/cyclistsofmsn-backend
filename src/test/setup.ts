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
import { TestRequest } from ".";
import mongoose from "mongoose";

let mongoUri: string;
let mongoServer: MongoMemoryServer | undefined;

// the test container is initialized once for the suite
let tc: DependencyContainer | undefined;

export type SuiteOptions = {
  // spin up a memory mongodb instance for testing purposes
  withDatabase: boolean;
};

/** entry point that should be included first in each describe block */
export const setupSuite = (options: Partial<SuiteOptions> = {}): void => {
  beforeAll(async () => {
    assert(tc === undefined);
    tc = await initializeSuite(options);

    await createDatabaseConnection();
  });

  afterAll(async () => {
    assert(tc);

    await clearDatabaseConnection();
    await cleanupSuite();
    tc = undefined;
  });
};

/**
 * Callers that make modifications to the container should do so in a CHILD container because the container is not reset
 * between test
 */
export const testContainer = (): DependencyContainer => {
  assert(tc);
  return tc;
};

/** return the object managing the connection to the mongodb instance */
export const testDatabase = (): Database => {
  return testContainer().resolve(Database);
};

const initializeSuite = async (
  options: Partial<SuiteOptions>
): Promise<DependencyContainer> => {
  const withDatabase = options.withDatabase;
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

const cleanupSuite = async (): Promise<void> => {
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

export const createTestUser = async () => {
  await mongoose.connection.collection("users").insertOne({
    username: "testuser",

    // this is a bcrypt of "password"
    hashed_password:
      "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",

    roles: [],
  });
};

export const createTestAdminUser = async () => {
  await mongoose.connection.collection("users")?.insertOne({
    username: "testadmin",

    // this is a bcrypt of "password"
    hashed_password:
      "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",

    roles: ["admin", "editor"],
  });
};

export const createTestEditorUser = async () => {
  await mongoose.connection.collection("users")?.insertOne({
    username: "testeditor",

    // this is a bcrypt of "password"
    hashed_password:
      "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",

    roles: ["editor"],
  });
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
