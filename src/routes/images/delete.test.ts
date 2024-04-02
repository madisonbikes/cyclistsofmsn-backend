import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { Image, ImageDocument, PostHistory } from "../../database";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
} from "../../test/data";

describe("server process - images", () => {
  let request: TestRequest;
  let testImageId: string;

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

    await request
      .delete(`/api/v1/images/${testImageId.toString()}`)
      .expect(200);

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
    expect(checkImage).not.toBeNull();

    const createdPostId = await createTestPost(checkImage as ImageDocument);

    // ensure post exists and is assigned to the image
    let checkPost = await PostHistory.findById(createdPostId);
    expect(checkPost?.image).toBeDefined();

    // delete the image
    await request
      .delete(`/api/v1/images/${testImageId.toString()}`)
      .expect(200);

    // image should not exist
    checkImage = await Image.findById(testImageId);
    expect(checkImage).toBeNull();

    checkPost = await PostHistory.findById(createdPostId);
    expect(checkPost).toBeDefined();
    expect(checkPost?.image).not.toBeDefined();
  });

  const createTestImage = async () => {
    const newImage = new Image({
      filename: "created.jpg",
      deleted: false,
      description_from_exif: false,
    });
    await newImage.save();
    return newImage._id.toString();
  };

  /** create a test post with the supplied image id */
  const createTestPost = async (image: ImageDocument) => {
    const newPost = new PostHistory({
      image,
      timestamp: new Date(),
      status: { flag: "pending" },
    });
    await newPost.save();
    return newPost._id.toString();
  };
});
