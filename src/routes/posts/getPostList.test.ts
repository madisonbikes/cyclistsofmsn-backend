import {
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { postListSchema } from "../contract";
import { createTestPosts, createTestUser } from "../../test/data";

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
    return request.get(`/api/v1/posts`).expect(401);
  });

  it("responds to post list api call", async () => {
    await createTestPosts();
    await loginTestUser(request);
    const postRequest = await request.get("/api/v1/posts").expect(200);
    const posts = postListSchema.parse(postRequest.body);
    expect(posts.length).toEqual(4);
    expect(posts[0].status.flag).toEqual("complete");
    expect(posts[0].imageid).toBeDefined();
    expect(posts[1].status.flag).toEqual("pending");
    expect(posts[1].imageid).toBeDefined();
    expect(posts[2].status.flag).toEqual("failed");
    expect(posts[2].imageid).toBeDefined();
    expect(posts[3].status.flag).toEqual("pending");
    expect(posts[3].imageid).not.toBeDefined();
  });
});
