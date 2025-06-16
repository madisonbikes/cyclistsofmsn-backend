import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { postHistoryModel } from "../../database";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestPosts,
  createTestUser,
} from "../../test/data";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

describe("server process - posts", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

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

  it("responds to unauthenticated post update api call", () => {
    return request.put(`/api/v1/posts/badid`).expect(401);
  });

  it("responds to non-editor post update api call", async () => {
    await loginTestUser(request);
    return request.put(`/api/v1/posts/badid`).expect(401);
  });

  it("responds to bad id post update api call", async () => {
    await loginTestAdminUser(request);
    return request.put(`/api/v1/posts/badid`).expect(404);
  });

  it("responds to missing id post update api call", async () => {
    await loginTestAdminUser(request);

    return request
      .put(`/api/v1/posts/000000000000000000000000`)
      .send({ description: "blarg" })
      .expect(404);
  });

  it("responds to post update api call", async () => {
    const { insertedPostIds } = await createTestPosts();

    await loginTestEditorUser(request);

    expect(insertedPostIds).not.toHaveLength(0);
    const goodId = insertedPostIds[0];
    await request
      .put(`/api/v1/posts/${goodId}`)
      .send({ status: { flag: "pending" } })
      .expect(200)
      .expect(/pending/);

    const checkPost = await postHistoryModel.findById(goodId);
    expect(checkPost).toBeDefined();
    expect(checkPost?.status.flag).toEqual("pending");
  });
});
