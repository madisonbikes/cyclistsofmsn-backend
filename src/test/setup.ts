import { configuration, testConfiguration } from "../config";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import { database } from "../database";
import { PhotoServer } from "../server";
import { Server } from "http";
import imageRepositoryScanner from "../scan";
import fs from "fs-extra";
import { beforeAll, afterEach, afterAll } from "vitest";

// This file sets up the test environment for the application, including
let photoServer: PhotoServer | undefined;
export let runningPhotoServer: Server | undefined;

export const testResourcesDir = () => {
  return path.resolve(__dirname, "../../test_resources");
};

interface SuiteOptions {
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
}

/** entry point that should be included first in each describe block */
export const setupSuite = (options: Partial<SuiteOptions> = {}): void => {
  const withDatabase = options.withDatabase ?? false;
  const withPhotoServer = options.withPhotoServer ?? false;
  const withMutableTestResources = options.withMutableTestResources ?? false;
  const clearPostHistory = options.clearPostHistory ?? false;
  const clearImages = options.clearImages ?? false;

  let mongoServer: MongoMemoryServer | undefined;

  beforeAll(async () => {
    testConfiguration.reset();
    testConfiguration.add({
      // disable valkey session for testing
      valkeySessionUri: "",

      // disable valkey cache for testing
      valkeyCacheUri: "",

      // tests don't use SSL
      secureCookie: false,
    });

    await initializeSuite(withMutableTestResources);

    if (withDatabase) {
      // start the mongo in-memory server on an ephemeral port
      mongoServer = await MongoMemoryServer.create();
      const mongodbUri = mongoServer.getUri();

      // set the custom mongodb uri
      testConfiguration.add({ mongodbUri });

      await database.start();
    }

    if (withPhotoServer) {
      photoServer = new PhotoServer();
      runningPhotoServer = await photoServer.create();
    }
  });

  afterEach(async () => {
    const queries: Promise<unknown>[] = [];
    if (clearPostHistory || withPhotoServer) {
      queries.push(database.posts.deleteMany({}));
    }
    if (clearImages || withPhotoServer) {
      queries.push(database.images.deleteMany({}));
    }

    if (queries.length > 0) {
      await Promise.all(queries);
    }

    // this has to run after we've wiped the database
    if (withPhotoServer) {
      await imageRepositoryScanner.start();
    }
  });

  afterAll(async () => {
    if (withPhotoServer) {
      runningPhotoServer = undefined;
      await photoServer?.stop();
      photoServer = undefined;
    }

    if (withDatabase) {
      await mongoServer?.stop();
      mongoServer = undefined;

      await database.stop();
    }

    await cleanupSuite(withMutableTestResources);
  });
};

const initializeSuite = async (withMutableTestResources: boolean) => {
  if (withMutableTestResources) {
    const random = Math.random().toString(36).substring(7);
    const mutablePhotosDir = path.resolve(
      __dirname,
      `../../output/mutable_test_resources_${random}`,
    );
    await fs.mkdirp(mutablePhotosDir);
    await fs.copy(testResourcesDir(), mutablePhotosDir);

    testConfiguration.add({ photosDir: mutablePhotosDir });
  } else {
    testConfiguration.add({ photosDir: testResourcesDir() });
  }
};

const cleanupSuite = async (withMutableTestResources: boolean) => {
  if (withMutableTestResources) {
    await fs.remove(configuration.photosDir);
  }
};
