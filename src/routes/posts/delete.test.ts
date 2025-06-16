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
} from "../../test/data.js";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { database, postHistoryModel } from "../../database/database.js";

describe("server process - posts", () => {
  let request: TestRequest;
  let testPostId: string;

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

    let checkPost = await postHistoryModel.findById(testPostId);
    expect(checkPost).not.toBeNull();

    await request.delete(`/api/v1/posts/${testPostId}`).expect(200);

    checkPost = await postHistoryModel.findById(testPostId);
    expect(checkPost).toBeNull();
  });

  const createTestPost = async () => {
    const retval = await database.posts.insertOne({
      timestamp: new Date(),
      status: { flag: "pending" },
    });
    return retval.insertedId.toHexString();
  };
});
