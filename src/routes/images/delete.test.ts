import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testContainer,
  testRequest,
  TestRequest,
} from "../../test";
import { PhotoServer } from "../../server";
import { Image } from "../../database";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

describe("server process - images", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;
  let testImageId: string;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());

    await Promise.all([
      createTestUser(),
      createTestAdminUser(),
      createTestEditorUser(),
    ]);
  });

  beforeEach(async () => {
    testImageId = await createTestImage();
  });

  afterEach(async () => {
    await deleteImage(testImageId);
  });

  afterAll(async () => {
    await photoServer.stop();
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

  const createTestImage = async () => {
    const retval = await mongoose.connection.collection("images").insertOne({
      filename: "created.jpg",
      deleted: false,
      description_from_exif: false,
    });
    return retval.insertedId.toString();
  };

  const deleteImage = (id: string) => {
    return mongoose.connection
      .collection("images")
      .deleteOne({ _id: new ObjectId(id) });
  };
});
