import { DEFAULT_SERVER_PORT, ServerConfiguration } from "../config";
import { container as rootContainer, singleton } from "tsyringe";
import path from "path";
import axios from "axios";

// this is just a random port
export const TEST_MONGODB_SERVER_PORT = 52333;

// this could be anything.
// FIXME maybe someday a different database per test suite to help allow parallel suites?
export const TEST_MONGODB_DATABASE_NAME = "test";

// the test container is preconfigured
export const testContainer = rootContainer.createChildContainer();

@singleton()
class TestConfiguration extends ServerConfiguration {
  constructor() {
    super();
    this.photosDir = path.resolve(
      __dirname,
      "../../test_resources");
    this.mongodbUri = `mongodb://localhost:${TEST_MONGODB_SERVER_PORT}/${TEST_MONGODB_DATABASE_NAME}?`;
  }
}

testContainer.register<ServerConfiguration>(ServerConfiguration, { useClass: TestConfiguration });
axios.defaults.baseURL = `http://localhost:${DEFAULT_SERVER_PORT}`;
