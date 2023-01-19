import {
  setupSuite,
  testContainer,
  testRequest,
  TestRequest,
} from "../../test";
import { PhotoServer } from "../../server";
import { Image } from "../../database";
import Cache from "../cache";
import { imageListSchema } from "../types";

describe("server process", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;
  let cache: Cache;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());
    cache = testContainer().resolve(Cache);
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  afterEach(async () => {
    // reset database
    await Image.deleteMany({ filename: "bad.jpg" });
    cache.clear();
  });

  it("responds to image list api call", () => {
    return request
      .get("/api/v1/images")
      .expect(200)
      .expect(({ text }) => {
        const o = JSON.parse(text);
        expect(o).toHaveLength(6);
      });
  });

  it("responds to single image api call", async () => {
    const response = await request.get("/api/v1/images").expect(200);

    const imageList = imageListSchema.parse(response.body);
    expect(imageList.length).toBeGreaterThan(0);

    const imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.ok).toBeTruthy();
  });

  it("failed response to invalid image call", () => {
    return request.get("/api/v1/images/badid").expect(404);
  });

  it("failed response to missing image call", async () => {
    const badImage = new Image();
    badImage.filename = "bad.jpg";
    await badImage.save();

    return request.get(`/api/v1/images/${badImage.id}`).expect(404);
  });

  it("returns second image request as cached", async () => {
    const response = await request.get("/api/v1/images").expect(200);

    const imageList = imageListSchema.parse(response.body);
    expect(imageList.length).toBeGreaterThan(0);

    // first image call
    let imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.get("x-cached-response")).toBeUndefined();

    imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.get("x-cached-response")).toEqual("HIT");
  });

  it("there is an image with an extracted description", async () => {
    const value = await request.get("/api/v1/images").expect(200);
    const images = imageListSchema.parse(value.body);
    const testImage = images.find(
      (v) => v.filename === "test_DSC07588_with_description.jpg"
    );
    expect(testImage).toBeDefined();
    expect(testImage?.description).toContain("riding a bike");
  });

  const requestGoodImage = async (id: string) => {
    const response = await request.get(`/api/v1/images/${id}`).expect(200);

    expect(response.get("content-type")).toEqual("image/jpeg");
    expect(response.body).toBeDefined();
    return response;
  };
});
