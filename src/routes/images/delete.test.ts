import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testRequest,
  type TestRequest,
} from "../../test/index.ts";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
} from "../../test/data.ts";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { imageModel, postHistoryModel } from "../../database/database.ts";
import type { DbImage } from "../../database/types.ts";

describe("server process - images", () => {
  let request: TestRequest;
  let testImageId: ObjectId;

  setupSuite({
    withDatabase: true,
    withPhotoServer: true,
    clearImages: true,
    clearPostHistory: true,
  });

  beforeAll(async () => {
    await Promise.all([
      createTestUser(),
      createTestAdminUser(),
      createTestEditorUser(),
    ]);
  });

  beforeEach(async () => {
    const testImage = await createTestImage();
    testImageId = testImage._id;
    request = testRequest();
  });

  it("responds to unauthenticated image delete api call", () => {
    return request.delete(`/api/v1/images/badid`).expect(401);
  });

  it("responds to non-admin image delete api call", async () => {
    await loginTestUser(request);
    return request.delete(`/api/v1/images/badid`).expect(401);
  });

  it("responds to non-admin image delete api call", async () => {
    await loginTestEditorUser(request);
    return request.delete(`/api/v1/images/badid`).expect(401);
  });

  it("responds to bad id image delete api call", async () => {
    await loginTestAdminUser(request);
    return request.delete(`/api/v1/images/badid`).expect(404);
  });

  it("responds to missing id image delete api call", async () => {
    await loginTestAdminUser(request);

    return request
      .delete(`/api/v1/images/000000000000000000000000`)
      .expect(404);
  });

  it("responds to image delete api call", async () => {
    await loginTestAdminUser(request);

    let checkImage = await imageModel.findById(testImageId);
    expect(checkImage).not.toBeNull();

    await request
      .delete(`/api/v1/images/${testImageId.toString()}`)
      .expect(200);

    checkImage = await imageModel.findById(testImageId);
    expect(checkImage).toBeNull();
  });

  it("responds to image delete api call and delete backing file", async () => {
    // TODO implement this test, problems due to static test_resources at the moment
  });

  it("responds to image delete api call, clearing posts that reference this image", async () => {
    await loginTestAdminUser(request);

    // make sure image exists
    let checkImage = await imageModel.findById(testImageId);
    expect(checkImage).toBeDefined();
    if (!checkImage) {
      throw new Error("Test image not found in database");
    }

    const createdPost = await createTestPost(checkImage);

    // ensure post exists and is assigned to the image
    let checkPost = await postHistoryModel.findById(createdPost._id);
    expect(checkPost?.image).toBeDefined();

    // delete the image
    await request
      .delete(`/api/v1/images/${testImageId.toString()}`)
      .expect(200);

    // image should not exist
    checkImage = await imageModel.findById(testImageId);
    expect(checkImage).toBeNull();

    checkPost = await postHistoryModel.findById(createdPost._id);
    expect(checkPost).toBeDefined();
    expect(checkPost?.image).not.toBeDefined();
  });

  const createTestImage = async () => {
    const newImage = await imageModel.insertOne({
      filename: "created.jpg",
      deleted: false,
      description_from_exif: false,
    });
    return newImage;
  };

  /** create a test post with the supplied image id */
  const createTestPost = async (image: DbImage) => {
    const inserted = await postHistoryModel.insertOne({
      image: image._id,
      timestamp: new Date(),
      status: { flag: "pending" },
    });
    return inserted;
  };
});
