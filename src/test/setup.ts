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
import { ImageRepositoryScanner } from "../scan";
import fs from "fs-extra";

let mongoUri: string;
let mongoServer: MongoMemoryServer | undefined;

// the test container is initialized once for the suite
let tc: DependencyContainer | undefined;

export let photoServer: PhotoServer | undefined;
export let runningPhotoServer: Server | undefined;

export const testResourcesDir = () => {
  return path.resolve(__dirname, "../../test_resources");
};

export type SuiteOptions = {
  // spin up a memory mongodb instance for testing purposes
  withDatabase: boolean;

  // start up a photoserver instance, which also resets image/post history database
  // after each test
  withPhotoServer: boolean;

  // do we need to ensure that the test resources are mutable?
  withMutableTestResources: boolean;

  // clear images after each test
  clearImages: boolean;

  // clear post history after each test
  clearPostHistory: boolean;
};

let mutablePhotosDir: string | undefined;

/** entry point that should be included first in each describe block */
export const setupSuite = (options: Partial<SuiteOptions> = {}): void => {
  const withDatabase = options.withDatabase ?? false;
  const withPhotoServer = options.withPhotoServer ?? false;
  const withMutableTestResources = options.withMutableTestResources ?? false;
  const clearPostHistory = options.clearPostHistory ?? false;
  const clearImages = options.clearImages ?? false;

  beforeAll(async () => {
    assert(tc === undefined);
    tc = await initializeSuite(withMutableTestResources);

    if (withDatabase) {
      // start the mongo in-memory server on an ephemeral port
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();

      // provide a Database object scoped to the container rather, overriding singleton normally
      tc.register<Database>(
        Database,
        { useClass: Database },
        { lifecycle: Lifecycle.ContainerScoped },
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
    assert(tc !== undefined);
    const queries: Array<Promise<unknown>> = [];
    if (clearPostHistory || withPhotoServer) {
      queries.push(testDatabase().collection("posts")?.deleteMany({}));
    }
    if (clearImages || withPhotoServer) {
      queries.push(testDatabase().collection("images")?.deleteMany({}));
    }

    if (queries.length > 0) {
      await Promise.all(queries);
    }

    // this has to run after we've wiped the database
    if (withPhotoServer) {
      const scanner = tc.resolve(ImageRepositoryScanner);
      await scanner.start();
    }
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

    await cleanupSuite(withMutableTestResources);
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

const initializeSuite = async (withMutableTestResources: boolean) => {
  // don't use value registrations because they will be cleared in the beforeEach() handler
  const testContainer = rootContainer.createChildContainer();

  // provide a custom TestConfiguration adapted for the testing environment
  testContainer.register<ServerConfiguration>(
    ServerConfiguration,
    { useClass: TestConfiguration },
    { lifecycle: Lifecycle.ContainerScoped },
  );

  const originalPhotosDir = testResourcesDir();
  if (withMutableTestResources) {
    const random = Math.random().toString(36).substring(7);
    mutablePhotosDir = path.resolve(
      __dirname,
      `../../output/mutable_test_resources_${random}`,
    );
    await fs.mkdirp(mutablePhotosDir);
    await fs.copy(originalPhotosDir, mutablePhotosDir);
  } else {
    mutablePhotosDir = originalPhotosDir;
  }
  return Promise.resolve(testContainer);
};

const cleanupSuite = async (withMutableTestResources: boolean) => {
  if (withMutableTestResources) {
    if (mutablePhotosDir != null) {
      await fs.remove(mutablePhotosDir);
      mutablePhotosDir = undefined;
    }
  }
};

@injectable()
class TestConfiguration extends ServerConfiguration {
  public override photosDir;
  public override mongodbUri;
  public override redisUri;
  public override secureCookie;

  constructor() {
    super();

    assert(mutablePhotosDir != null, "mutablePhotosDir not set");
    this.photosDir = mutablePhotosDir;

    // use static mongo URI set in suite initialization
    this.mongodbUri = mongoUri;

    // don't enable redis for testing
    this.redisUri = "";

    // tests don't use SSL
    this.secureCookie = false;
  }
}
