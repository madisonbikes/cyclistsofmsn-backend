import { setupSuite, testContainer, testRequest, TestRequest } from "./test";
import { PhotoServer } from "./server";
import { Image } from "./database";

describe("server process", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  it("responds to image list api call", async () => {
    return request
      .get("/images")
      .expect(200)
      .expect(({ text }) => {
        const o = JSON.parse(text);
        expect(o).toHaveLength(5);
      });
  });

  it("responds to single image api call", async () => {
    const response = await request
      .get("/images")
      .expect(200);

    const imageList = JSON.parse(response.text);
    expect(imageList).toHaveLength(5);

    const id = imageList[0].id;
    const imageResponse = await request
      .get(`/images/${id}`)
      .expect(200);

    const headers = imageResponse.headers;
    const type = headers["content-type"];
    expect(type).toEqual("image/jpeg");
    expect(imageResponse.body).toBeDefined();
  });

  it("failed response to invalid image call", async () => {
    return request
      .get("/images/badid")
      .expect(404);
  });

  it("failed response to missing image call", async () => {
    const badImage = new Image();
    badImage.filename = "bad.jpg";
    await badImage.save();

    return request
      .get(`/images/${badImage.id}`)
      .expect(404);
  });
});
