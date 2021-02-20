import { ServerConfiguration } from "../config";
import { container as rootContainer, singleton } from "tsyringe";
import path from "path";
import axios from "axios";

export const container = rootContainer.createChildContainer()

@singleton()
class TestConfiguration extends ServerConfiguration {
  constructor() {
    super()
    this.photosDir = path.resolve(
      __dirname,
      "../../test_resources");
    this.mongodbUri = "mongodb://127.0.0.1:52333/test?";
  }
}
container.register<ServerConfiguration>(ServerConfiguration, { useClass: TestConfiguration })
axios.defaults.baseURL = `http://localhost:3001`;
