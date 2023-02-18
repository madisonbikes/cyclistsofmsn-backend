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
import { PhotoServer } from "../server";
import { Server } from "./request";

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
  const withDatabase = options.withDatabase ?? false;
  const withPhotoServer = options.withPhotoServer ?? false;
  beforeAll(async () => {
    assert(tc === undefined);
    tc = await initializeSuite();

    if (withDatabase) {
      // start the mongo in-memory server on an ephemeral port
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();

      // provide a Database object scoped to the container rather, overriding singleton normally
      tc.register<Database>(
        Database,
        { useClass: Database },
        { lifecycle: Lifecycle.ContainerScoped }
      );

      await testDatabase().start();
    } else {
      // if database not enabled, trigger an error if we try to inject a database object
      tc.register<Database>(Database, {
        useFactory: () => {
          throw new Error("No database allowed for this test suite");
        },
      });
    }

    if (withPhotoServer) {
      photoServer = tc.resolve(PhotoServer);
      runningPhotoServer = await photoServer.create();
    }
  });

  afterEach(async () => {
    const queries: Array<Promise<unknown>> = [];
    if (options.clearPostHistory ?? false) {
      queries.push(testDatabase().collection("posts")?.deleteMany({}));
    }
    if (options.clearImages ?? false) {
      queries.push(testDatabase().collection("images")?.deleteMany({}));
    }
    await Promise.all(queries);
  });

  afterAll(async () => {
    assert(tc);

    if (withPhotoServer) {
      runningPhotoServer = undefined;
      await photoServer?.stop();
      photoServer = undefined;
    }

    if (withDatabase) {
      await mongoServer?.stop();
      mongoServer = undefined;

      await testDatabase().stop();
    }

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

const initializeSuite = () => {
  // don't use value registrations because they will be cleared in the beforeEach() handler
  const testContainer = rootContainer.createChildContainer();

  // provide a custom TestConfiguration adapted for the testing environment
  testContainer.register<ServerConfiguration>(
    ServerConfiguration,
    { useClass: TestConfiguration },
    { lifecycle: Lifecycle.ContainerScoped }
  );
  return Promise.resolve(testContainer);
};

const cleanupSuite = async () => {
  // empty
};

@injectable()
class TestConfiguration extends ServerConfiguration {
  public override photosDir;
  public override mongodbUri;
  public override redisUri;
  public override secureCookie;

  constructor() {
    super();

    this.photosDir = path.resolve(__dirname, "../../test_resources");

    // use static mongo URI set in suite initialization
    this.mongodbUri = mongoUri;

    // don't enable redis for testing
    this.redisUri = "";

    // tests don't use SSL
    this.secureCookie = false;
  }
}
