import {
  loginTestUser,
  setupSuite,
  testRequest,
  type TestRequest,
} from "../../test/index.ts";
import { postListSchema } from "../contract/index.ts";
import { createTestPosts, createTestUser } from "../../test/data.ts";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

describe("server process - posts", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeAll(async () => {
    await createTestUser();
  });

  beforeEach(() => {
    request = testRequest();
  });

  it("responds to unauthenticated post list api call", () => {
    return request.get(`/api/v1/posts`).expect(200);
  });

  it("responds to post list api call", async () => {
    const { insertedImageId, insertedPostIds } = await createTestPosts();
    await loginTestUser(request);
    const postRequest = await request.get("/api/v1/posts").expect(200);
    const posts = postListSchema.parse(postRequest.body);
    expect(posts.length).toEqual(4);

    // ensure posts are returned in proper, sorted order by timestamp asc
    expect(posts[0].status.flag).toEqual("complete");
    expect(posts[0].imageid).toEqual(insertedImageId);
    expect(posts[0].id).toEqual(insertedPostIds[1]);

    expect(posts[1].status.flag).toEqual("pending");
    expect(posts[1].imageid).toBeDefined();
    expect(posts[1].id).toEqual(insertedPostIds[2]);

    expect(posts[2].status.flag).toEqual("failed");
    expect(posts[2].imageid).toBeDefined();
    expect(posts[2].id).toEqual(insertedPostIds[0]);

    expect(posts[3].status.flag).toEqual("pending");
    expect(posts[3].imageid).toEqual(undefined);
    expect(posts[3].id).toEqual(insertedPostIds[3]);
  });
});
