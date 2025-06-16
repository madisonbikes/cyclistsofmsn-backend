import { setupSuite, testRequest, TestRequest } from "../test";
import { createTestUser } from "../test/data";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";

describe("login route", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeAll(async () => {
    // create a test user for login
    await createTestUser();
  });

  beforeEach(() => {
    request = testRequest();
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
          ]),
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

  it("responds to login api with good username, bad credentials as unauthorized", () => {
    return request
      .post("/api/v1/session/login")
      .send({ username: "testuser", password: "wrong_password" })
      .expect(401);
  });

  it("responds to login api with bad username (and bad password) as unauthorized", () => {
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
