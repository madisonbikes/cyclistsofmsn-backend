import { PhotoServer } from "./server";
import axios from "axios";
import { expect } from "chai";
import { testContainer } from "./test/setup";
import { Image } from "./database";

// FIXME don't use axios for testing REST, use something like supertest/superagent
describe("server process", () => {
  let photoServer: PhotoServer | undefined;

  beforeEach(() => {
    testContainer.clearInstances();
  });

  before(async () => {
    photoServer = testContainer.resolve(PhotoServer);
    await photoServer.start();
  });

  after(async () => {
    await photoServer?.stop();
    photoServer = undefined;
  });

  it("responds to image list api call", async () => {
    const imageResponse = await axios.get("/images");
    expect(imageResponse.status).eq(200);
    expect(imageResponse.data.length).eq(5);
  });

  it("responds to single image api call", async () => {
    const imageListResponse = await axios.get("/images");

    expect(imageListResponse.status).eq(200);
    expect(imageListResponse.data.length).eq(5);

    const id = imageListResponse.data[0].id;
    const imageResponse = await axios.get(`/images/${id}`);
    expect(imageResponse.status).eq(200);
    const headers = imageResponse.headers;
    const type = headers["content-type"];
    expect(type).eq("image/jpeg");
    expect(imageResponse.data).to.exist;
  });

  it("failed response to invalid image call", async () => {
    try {
      await axios.get("/images/badid");
      expect(false);
    } catch (err) {
      expect(err.response.status).eq(404);
    }
  });

  it("failed response to missing image call", async () => {
    const badImage = new Image();
    badImage.filename = "bad.jpg";
    await badImage.save();

    try {
      await axios.get(`/images/${badImage.id}`);
      expect(false);
    } catch (err) {
      expect(err.response.status).eq(404);
    }
  });
});
