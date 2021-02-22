import { setupTestContainer, testContainer } from "./test";
import { PhotoServer } from "./server";
import axios from "axios";
import { Image } from "./database";

// FIXME don't use axios for testing REST, use something like supertest/superagent
describe("server process", () => {
  let photoServer: PhotoServer;

  setupTestContainer()

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    await photoServer.start();
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  it("responds to image list api call", async () => {
    const imageResponse = await axios.get("/images");
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).toHaveLength(5);
  });

  it("responds to single image api call", async () => {
    const imageListResponse = await axios.get("/images");

    expect(imageListResponse.status).toEqual(200);
    expect(imageListResponse.data).toHaveLength(5);

    const id = imageListResponse.data[0].id;
    const imageResponse = await axios.get(`/images/${id}`);
    expect(imageResponse.status).toEqual(200);
    const headers = imageResponse.headers;
    const type = headers["content-type"];
    expect(type).toEqual("image/jpeg");
    expect(imageResponse.data).toBeDefined();
  });

  it("failed response to invalid image call", async () => {
    try {
      await axios.get("/images/badid");
      expect(false).toBe(true);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("failed response to missing image call", async () => {
    const badImage = new Image();
    badImage.filename = "bad.jpg";
    await badImage.save();

    try {
      await axios.get(`/images/${badImage.id}`);
      expect(false).toEqual(true);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });
});
