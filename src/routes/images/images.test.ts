import {
  createTestUser,
  loginTestUser,
  setupSuite,
  testContainer,
  testRequest,
  TestRequest,
} from "../../test";
import { PhotoServer } from "../../server";
import { Image } from "../../database";
import { Cache } from "../cache";
import { imageListSchema } from "../contract";

describe("server process - images", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;
  let cache: Cache;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());
    cache = testContainer().resolve(Cache);

    await createTestUser();
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  afterEach(async () => {
    // reset database
    await Image.deleteMany({ filename: "bad.jpg" });
    cache.clear();
  });

  it("responds to image list api call", async () => {
    await loginTestUser(request);
    return request
      .get("/api/v1/images")
      .expect(200)
      .expect(({ text }) => {
        const o = JSON.parse(text);
        expect(o).toHaveLength(6);
      });
  });

  it("responds to image list api call with empty timestamp", async () => {
    const emptyTimestampImage = new Image();
    emptyTimestampImage.filename = "bad.jpg";
    await emptyTimestampImage.save();

    await loginTestUser(request);
    return request
      .get("/api/v1/images")
      .expect(200)
      .expect(({ text }) => {
        const o = JSON.parse(text);
        expect(o).toHaveLength(7);
      });
  });

  it("responds to single image api call", async () => {
    await loginTestUser(request);
    const response = await request.get("/api/v1/images").expect(200);

    const imageList = imageListSchema.parse(response.body);
    expect(imageList.length).toBeGreaterThan(0);

    const imageResponse = await requestGoodImage(imageList[0].id);
    expect(imageResponse.ok).toBeTruthy();
  });

  it("failed response to invalid image call", () => {
    return request.get("/api/v1/images/badid").expect(404);
  });

  it("failed response to invalid image binary call", () => {
    return request.get("/api/v1/images/badid/binary").expect(404);
  });

  it("failed response to missing image file binary call", async () => {
    const badImage = new Image();
    badImage.filename = "bad.jpg";
    await badImage.save();

    return request.get(`/api/v1/images/${badImage.id}/binary`).expect(404);
  });

  it("success response to missing image file metadata call", async () => {
    const badImage = new Image();
    badImage.filename = "bad.jpg";
    await badImage.save();

    return request
      .get(`/api/v1/images/${badImage.id}`)
      .expect(200)
      .expect((res) =>
        expect(res.body).toEqual(
          expect.objectContaining({ filename: "bad.jpg" })
        )
      );
  });

  it("returns second image request as cached", async () => {
    await loginTestUser(request);
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
    await loginTestUser(request);
    const value = await request.get("/api/v1/images").expect(200);
    const images = imageListSchema.parse(value.body);
    const testImage = images.find(
      (v) => v.filename === "test_DSC07588_with_description.jpg"
    );
    expect(testImage).toBeDefined();
    expect(testImage?.description).toContain("riding a bike");
  });

  const requestGoodImage = async (id: string) => {
    const response = await request
      .get(`/api/v1/images/${id}/binary`)
      .expect(200);

    expect(response.get("content-type")).toEqual("image/jpeg");
    expect(response.body).toBeDefined();
    return response;
  };
});
