import {
  createTestUser,
  setupSuite,
  testContainer,
  testRequest,
  TestRequest,
} from "../test";
import { PhotoServer } from "../server";

describe("login route", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());

    // create a test user for login
    await createTestUser();
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  afterEach(() => {
    // ensure serverside sessions are removed
    return request.post("/api/v1/session/logout");
  });

  it("responds to login api with good credentials successfully", () => {
    return request
      .post("/api/v1/session/login")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .expect(() => {
        // nothing
      });
  });

  it("responds to login api without credentials as bad request", () => {
    return request
      .post("/api/v1/session/login")
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "invalid_type",
              path: ["username"],
            }),
            expect.objectContaining({
              code: "invalid_type",
              path: ["password"],
            }),
          ])
        );
      });
  });

  it("responds to login api with extra fields as bad request", () => {
    return request
      .post("/api/v1/session/login")
      .send({ username: "user1", password: "password", extraxyz: "extra" })
      .expect(400)
      .expect(/unrecognized_keys/)
      .expect(/extraxyz/);
  });

  it("responds to login api with credentials as success request but unauthorized", () => {
    return request
      .post("/api/v1/session/login")
      .send({ username: "bad", password: "bad" })
      .expect(401);
  });

  it("responds to logout api with good session successfully", async () => {
    await request
      .post("/api/v1/session/login")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .expect(() => {
        // nothing
      });

    await request
      .post("/api/v1/session/logout")
      .expect(200)
      .expect(/logged out/);
  });

  it("responds to logout api with bad session failure", async () => {
    await request.post("/api/v1/session/logout").expect(400);
  });

  it("responds to session info with good session successfully", async () => {
    await request
      .post("/api/v1/session/login")
      .send({ username: "testuser", password: "password" })
      .expect(200);

    await request
      .get("/api/v1/session/info")
      .expect(200)
      .expect(/testuser/);
  });

  it("responds to session info with no session", async () => {
    await request.get("/api/v1/session/info").expect(401);
  });
});
