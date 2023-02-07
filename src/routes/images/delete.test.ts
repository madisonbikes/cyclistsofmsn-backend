import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { Image, PostHistory } from "../../database";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
} from "../../test/data";

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
    testImageId = await createTestImage();
    request = testRequest();
  });

  afterEach(async () => {
    await deleteImage(testImageId);
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

    let checkImage = await Image.findById(testImageId);
    expect(checkImage).not.toBeNull();

    await request.delete(`/api/v1/images/${testImageId}`).expect(200);

    checkImage = await Image.findById(testImageId);
    expect(checkImage).toBeNull();
  });

  it("responds to image delete api call and delete backing file", async () => {
    // TODO implement this test, problems due to static test_resources at the moment
  });

  it("responds to image delete api call, clearing posts that reference this image", async () => {
    await loginTestAdminUser(request);

    // make sure image exists
    let checkImage = await Image.findById(testImageId);
    expect(checkImage).toBeDefined();

    const createdPostId = await createTestPost(testImageId);

    // ensure post exists and is assigned to the image
    let checkPost = await PostHistory.findById(createdPostId);
    expect(checkPost?.image).toBeDefined();

    // delete the image
    await request.delete(`/api/v1/images/${testImageId}`).expect(200);

    // image should not exist
    checkImage = await Image.findById(testImageId);
    expect(checkImage).toBeNull();

    checkPost = await PostHistory.findById(createdPostId);
    expect(checkPost).toBeDefined();
    expect(checkPost?.image).not.toBeDefined();
  });

  const createTestImage = async () => {
    const retval = await mongoose.connection.collection("images").insertOne({
      filename: "created.jpg",
      deleted: false,
      description_from_exif: false,
    });
    return retval.insertedId;
  };

  /** create a test post with the supplied image id */
  const createTestPost = async (image: ObjectId) => {
    const retval = await mongoose.connection.collection("posts").insertOne({
      image,
      timestamp: new Date(),
      status: { flag: "pending" },
    });
    return retval.insertedId;
  };

  const deleteImage = (_id: ObjectId) => {
    return mongoose.connection.collection("images").deleteOne({ _id });
  };
});
