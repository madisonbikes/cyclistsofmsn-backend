import { dispatchPostOnSchedule } from "../posts/dispatcher.ts";
import { populatePostsOnSchedule } from "../posts/populate.ts";
import { testConfiguration } from "../config.ts";
import { setupSuite, testRequest } from "../test/index.ts";
import { vi, describe, it, expect, beforeAll, beforeEach } from "vitest";

vi.mock("../posts/dispatcher");
vi.mock("../posts/populate");

const dispatchPostOnScheduleMock = vi.mocked(dispatchPostOnSchedule);
const populatePostsOnScheduleMock = vi.mocked(populatePostsOnSchedule);

describe("Cron Routes", () => {
  setupSuite({ withDatabase: true, withPhotoServer: true });

  const cronAuthorizationApiKey = "test-api-key";

  beforeAll(() => {
    testConfiguration.add({ cronAuthorizationApiKey });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /dispatchPost", () => {
    it("should return 204 when authorized", async () => {
      const response = await testRequest()
        .post("/api/v1/cron/dispatchPost")
        .set("Authorization", `Bearer ${cronAuthorizationApiKey}`);

      expect(response.status).toBe(204);
      expect(dispatchPostOnScheduleMock).toHaveBeenCalled();
    });

    it("should return 401 when unauthorized", async () => {
      const response = await testRequest()
        .post("/api/v1/cron/dispatchPost")
        .set("Authorization", "Bearer wrong-api-key");

      expect(response.status).toBe(401);
      expect(dispatchPostOnScheduleMock).not.toHaveBeenCalled();
    });

    it("should return 401 when unauthorized (no auth provided)", async () => {
      const response = await testRequest().post("/api/v1/cron/dispatchPost");

      expect(response.status).toBe(401);
      expect(dispatchPostOnScheduleMock).not.toHaveBeenCalled();
    });
  });

  describe("POST /populatePosts", () => {
    it("should return 204 when authorized", async () => {
      const response = await testRequest()
        .post("/api/v1/cron/populatePosts")
        .set("Authorization", `Bearer ${cronAuthorizationApiKey}`);

      expect(response.status).toBe(204);
      expect(populatePostsOnScheduleMock).toHaveBeenCalled();
    });

    it("should return 401 when unauthorized", async () => {
      const response = await testRequest()
        .post("/api/v1/cron/populatePosts")
        .set("Authorization", "Bearer wrong-api-key");

      expect(response.status).toBe(401);
      expect(populatePostsOnScheduleMock).not.toHaveBeenCalled();
    });

    it("should return 401 when unauthorized (no auth provided)", async () => {
      const response = await testRequest().post("/api/v1/cron/populatePosts");

      expect(response.status).toBe(401);
      expect(populatePostsOnScheduleMock).not.toHaveBeenCalled();
    });
  });
});
