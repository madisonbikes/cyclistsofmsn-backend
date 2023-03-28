import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testDatabase,
  testRequest,
  TestRequest,
} from "../../test";
import { PostHistory } from "../../database";
import { ObjectId } from "mongodb";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
} from "../../test/data";

describe("server process - posts", () => {
  let request: TestRequest;
  let testPostId: ObjectId;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeAll(async () => {
    await Promise.all([
      createTestUser(),
      createTestAdminUser(),
      createTestEditorUser(),
    ]);
  });

  beforeEach(async () => {
    testPostId = await createTestPost();
    request = testRequest();
  });

  afterEach(async () => {
    await deletePost(testPostId);
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
    const retval = await testDatabase().collection("posts").insertOne({});
    return retval.insertedId;
  };

  const deletePost = (_id: ObjectId) => {
    return testDatabase().collection("posts").deleteOne({ _id });
  };
});
