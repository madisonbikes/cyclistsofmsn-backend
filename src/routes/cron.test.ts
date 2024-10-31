import { dispatchPostOnSchedule } from "../posts/dispatcher";
import { populatePostsOnSchedule } from "../posts/populate";
import { testConfiguration } from "../config";
import { setupSuite, testRequest } from "../test";

jest.mock("../posts/dispatcher");
jest.mock("../posts/populate");

const dispatchPostOnScheduleMock = jest.mocked(dispatchPostOnSchedule);
const populatePostsOnScheduleMock = jest.mocked(populatePostsOnSchedule);

describe("Cron Routes", () => {
  setupSuite({ withDatabase: true, withPhotoServer: true });

  const cronAuthorizationApiKey = "test-api-key";

  beforeAll(() => {
    testConfiguration.add({ cronAuthorizationApiKey });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /schedulePost", () => {
    it("should return 204 when authorized", async () => {
      const response = await testRequest()
        .post("/api/v1/cron/schedulePost")
        .set("Authorization", `Bearer ${cronAuthorizationApiKey}`);

      expect(response.status).toBe(204);
      expect(dispatchPostOnScheduleMock).toHaveBeenCalled();
    });

    it("should return 401 when unauthorized", async () => {
      const response = await testRequest()
        .post("/api/v1/cron/schedulePost")
        .set("Authorization", "Bearer wrong-api-key");

      expect(response.status).toBe(401);
      expect(dispatchPostOnScheduleMock).not.toHaveBeenCalled();
    });

    it("should return 401 when unauthorized", async () => {
      const response = await testRequest().post("/api/v1/cron/schedulePost");

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

    it("should return 401 when unauthorized", async () => {
      const response = await testRequest().post("/api/v1/cron/populatePosts");

      expect(response.status).toBe(401);
      expect(populatePostsOnScheduleMock).not.toHaveBeenCalled();
    });
  });
});
