import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testRequest,
  type TestRequest,
} from "../../test/index.js";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
  getGoodImageId,
} from "../../test/data.js";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { imageModel } from "../../database/database.js";

describe("server process - images", () => {
  let request: TestRequest;

  setupSuite({
    withDatabase: true,
    withPhotoServer: true,
    withMutableTestResources: true,
  });

  beforeAll(async () => {
    await Promise.all([
      createTestUser(),
      createTestAdminUser(),
      createTestEditorUser(),
    ]);
  });

  beforeEach(() => {
    request = testRequest();
  });

  it("responds to unauthenticated image update api call", () => {
    return request.put(`/api/v1/images/badid`).expect(401);
  });

  it("responds to non-editor image update api call", async () => {
    await loginTestUser(request);
    return request.put(`/api/v1/images/badid`).expect(401);
  });

  it("responds to bad id image update api call", async () => {
    await loginTestAdminUser(request);
    return request.put(`/api/v1/images/badid`).expect(404);
  });

  it("responds to missing id image update api call", async () => {
    await loginTestAdminUser(request);

    return request
      .put(`/api/v1/images/000000000000000000000000`)
      .send({ description: "blarg" })
      .expect(404);
  });

  it("responds to image update api call", async () => {
    await loginTestEditorUser(request);
    const goodImageId = await getGoodImageId();

    await request
      .put(`/api/v1/images/${goodImageId.toString()}`)
      .send({ description: "blarg" })
      .expect(200)
      .expect(/blarg/);

    const checkImage = await imageModel.findById(goodImageId);
    expect(checkImage).toBeDefined();
    expect(checkImage?.description).toEqual("blarg");

    // this used to false, but not we propagate exif data to the file
    expect(checkImage?.description_from_exif).toEqual(true);
  });

  it("responds to image update api call setting hidden", async () => {
    await loginTestEditorUser(request);
    const goodImageId = await getGoodImageId();

    await request
      .put(`/api/v1/images/${goodImageId.toString()}`)
      .send({ hidden: true })
      .expect(200);

    const checkImage = await imageModel.findById(goodImageId);
    expect(checkImage).toBeDefined();
    expect(checkImage?.hidden).toBe(true);
  });
});
