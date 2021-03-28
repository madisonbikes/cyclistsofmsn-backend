import { setupSuite, testContainer, testRequest, TestRequest } from "./test";
import { PhotoServer } from "./server";
import { Image } from "./database";
import { MemoryCache } from "./routes/cache";
import * as superagent from "superagent";

describe("server process", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;
  let memoryCache: MemoryCache;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());
    memoryCache = testContainer().resolve(MemoryCache);
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  beforeEach(async () => {
    memoryCache.clear();
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
    expect(imageList.length).toBeGreaterThan(0);

    const imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.ok).toBeTruthy();
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


  it("returns second image request as cached", async () => {
    const response = await request
      .get("/images")
      .expect(200);

    const imageList = JSON.parse(response.text);
    expect(imageList.length).toBeGreaterThan(0);

    // first image call
    let imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.get("x-cached-response")).toBeUndefined();

    imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.get("x-cached-response")).toEqual("HIT");
  });

  async function requestGoodImage(id: string): Promise<superagent.Response> {
    const response = await request
      .get(`/images/${id}`)
      .expect(200);

    expect(response.get("content-type"))
      .toEqual("image/jpeg");
    expect(response.body).toBeDefined();
    return response;
  }
});
