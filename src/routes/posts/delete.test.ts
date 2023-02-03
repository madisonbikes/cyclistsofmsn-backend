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
import { PostHistory } from "../../database";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

describe("server process - posts", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;
  let testPostId: string;

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
    testPostId = await createTestPost();
  });

  afterEach(async () => {
    await deletePost(testPostId);
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  it("responds to unauthenticated post delete api call", () => {
    return request.delete(`/api/v1/posts/badid`).expect(401);
  });

  it("responds to non-admin post post api call", async () => {
    await loginTestUser(request);
    return request.delete(`/api/v1/posts/badid`).expect(401);
  });

  it("responds to non-admin post delete api call", async () => {
    await loginTestEditorUser(request);
    return request.delete(`/api/v1/posts/badid`).expect(401);
  });

  it("responds to bad id post delete api call", async () => {
    await loginTestAdminUser(request);
    return request.delete(`/api/v1/posts/badid`).expect(404);
  });

  it("responds to missing id post delete api call", async () => {
    await loginTestAdminUser(request);

    return request.delete(`/api/v1/posts/000000000000000000000000`).expect(404);
  });

  it("responds to post delete api call", async () => {
    await loginTestAdminUser(request);

    let checkPost = await PostHistory.findById(testPostId);
    expect(checkPost).not.toBeNull();

    await request.delete(`/api/v1/posts/${testPostId}`).expect(200);

    checkPost = await PostHistory.findById(testPostId);
    expect(checkPost).toBeNull();
  });

  const createTestPost = async () => {
    const retval = await mongoose.connection.collection("posts").insertOne({});
    return retval.insertedId.toString();
  };

  const deletePost = (id: string) => {
    return mongoose.connection
      .collection("posts")
      .deleteOne({ _id: new ObjectId(id) });
  };
});
