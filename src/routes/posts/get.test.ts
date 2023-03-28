import {
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { createTestPosts, createTestUser } from "../../test/data";
import { postSchema } from "../contract";

describe("server process - posts", () => {
  let request: TestRequest;

  setupSuite({
    withDatabase: true,
    withPhotoServer: true,
    clearPostHistory: true,
    clearImages: true,
  });

  beforeAll(async () => {
    await createTestUser();
  });

  beforeEach(() => {
    request = testRequest();
  });

  it("responds to single post api call", async () => {
    const { insertedPostIds } = await createTestPosts();
    await loginTestUser(request);

    const id = insertedPostIds[0];
    const postResponse = await request.get(`/api/v1/posts/${id}`).expect(200);
    const parsed = postSchema.parse(postResponse.body);
    expect(parsed).toBeDefined();
  });

  it("failed response to to single unauthenticated post api call", async () => {
    const { insertedPostIds } = await createTestPosts();
    const id = insertedPostIds[0];
    return request.get(`/api/v1/posts/${id}`).expect(401);
  });

  it("failed response to invalid post call", async () => {
    await loginTestUser(request);
    return request.get("/api/v1/posts/badid").expect(404);
  });

  it("failed response to post call with missing id", async () => {
    await loginTestUser(request);
    return request.get(`/api/v1/posts/000000000000`).expect(404);
  });

  it("responds to single current post api call", async () => {
    await createTestPosts();
    const postResponse = await request.get(`/api/v1/posts/current`).expect(200);
    const parsed = postSchema.parse(postResponse.body);
    expect(parsed).toBeDefined();
  });

  it("responds to single current post api call with no posts", () => {
    return request.get(`/api/v1/posts/current`).expect(404);
  });
});
