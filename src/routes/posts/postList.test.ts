import {
  createTestUser,
  loginTestUser,
  setupSuite,
  testContainer,
  testRequest,
  TestRequest,
} from "../../test";
import { PhotoServer } from "../../server";
import mongoose from "mongoose";
import { postSchema } from "../types";

describe("server process", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());

    await createTestUser();
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  it("responds to unauthenticated post list api call", () => {
    return request.get(`/api/v1/posts`).expect(401);
  });

  it("responds to post list api call", async () => {
    await createTestPosts();
    await loginTestUser(request);
    const postRequest = await request.get("/api/v1/posts").expect(200);
    const posts = postSchema.array().parse(postRequest.body);
    expect(posts.length).toEqual(3);
    expect(posts[0].status.flag).toEqual("complete");
    expect(posts[1].status.flag).toEqual("pending");
    expect(posts[2].status.flag).toEqual("failed");
  });

  const createTestPosts = async () => {
    const { insertedId } = await mongoose.connection
      .collection("images")
      .insertOne({
        filename: "blarg.jpg",
        deleted: false,
        description_from_exif: false,
      });
    await mongoose.connection.collection("posts").insertMany([
      {
        image: insertedId,
        timestamp: new Date(Date.now() + 2000),
        status: { flag: "failed" },
      },
      {
        image: insertedId,
        timestamp: new Date(Date.now()),
        status: { flag: "complete" },
      },
      {
        image: insertedId,
        timestamp: new Date(Date.now() + 1000),
        status: { flag: "pending" },
      },
    ]);
  };
});
