import {
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { imageListSchema } from "../contract";
import { createTestUser } from "../../test/data";
import { database } from "../../database";
import fs_cache from "../../utils/fs_cache";

describe("server process - images", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeAll(async () => {
    await createTestUser();
  });

  beforeEach(async () => {
    await fs_cache.clear();

    request = testRequest();
  });

  it("responds to image list api call", async () => {
    await loginTestUser(request);
    const images = await request.get("/api/v1/images").expect(200);
    const parsed = imageListSchema.parse(images.body);
    expect(parsed).toHaveLength(6);
  });

  it("responds to image list api call with empty timestamp", async () => {
    await createMissingImage();

    await loginTestUser(request);
    const images = await request.get("/api/v1/images").expect(200);

    const parsed = imageListSchema.parse(images.body);
    expect(parsed).toHaveLength(7);
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

  it("failed response to image binary call with bad query params", async () => {
    await loginTestUser(request);
    const response = await request.get("/api/v1/images").expect(200);

    const imageList = imageListSchema.parse(response.body);
    expect(imageList.length).toBeGreaterThan(0);
    const imageId = imageList[0].id;

    return request
      .get(`/api/v1/images/${imageId}/binary?width=bad`)
      .expect(400);
  });

  it("successful response to image binary call with extra query params", async () => {
    await loginTestUser(request);
    const response = await request.get("/api/v1/images").expect(200);

    const imageList = imageListSchema.parse(response.body);
    expect(imageList.length).toBeGreaterThan(0);
    const imageId = imageList[0].id;

    return request
      .get(`/api/v1/images/${imageId}/binary?extra=argument`)
      .expect(200);
  });

  it("failed response to missing image file binary call", async () => {
    const missingImage = await createMissingImage();

    return request
      .get(`/api/v1/images/${missingImage.insertedId.toString()}/binary`)
      .expect(404);
  });

  it("successful response to missing image file metadata call", async () => {
    const missingImage = await createMissingImage();

    return request
      .get(`/api/v1/images/${missingImage.insertedId.toString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({ filename: "missing.jpg" }),
        );
      });
  });

  it("failed response to image file metadata call with missing id", () => {
    return request.get(`/api/v1/images/000000000000`).expect(404);
  });

  it("failed response to image file binary call with missing id", () => {
    return request.get(`/api/v1/images/000000000000/binary`).expect(404);
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
      (v) => v.filename === "test_DSC07588_with_description.jpg",
    );
    expect(testImage).toBeDefined();
    expect(testImage?.description).toContain("riding a bike");
    expect(testImage?.height).toBe(2415);
    expect(testImage?.width).toBe(3622);
  });

  it("a marked hidden image returns as hidden", async () => {
    await loginTestUser(request);

    const hiddenFilename = "test_DSC_7020.jpg";
    await markImageHidden(hiddenFilename);

    const value = await request.get("/api/v1/images").expect(200);
    const images = imageListSchema.parse(value.body);
    const testImage = images.find((v) => v.filename === hiddenFilename);
    expect(testImage).toBeDefined();
    expect(testImage?.hidden).toBe(true);
  });

  const requestGoodImage = async (id: string) => {
    const response = await request
      .get(`/api/v1/images/${id}/binary`)
      .expect(200);

    expect(response.get("content-type")).toEqual("image/jpeg");
    expect(response.body).toBeDefined();
    return response;
  };

  const createMissingImage = async () => {
    const retval = await database.collection("images").insertOne({
      filename: "missing.jpg",
      deleted: false,
      description_from_exif: false,
    });
    return retval;
  };

  const markImageHidden = async (filename: string) => {
    const retval = await database
      .collection("images")
      .updateOne({ filename }, { $set: { hidden: true } });
    expect(retval.modifiedCount).toBe(1);
    return retval;
  };
});
