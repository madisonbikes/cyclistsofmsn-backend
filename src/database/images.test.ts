import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupSuite } from "../test/setup";

describe("database model - images", () => {
  setupSuite({
    withDatabase: true,
    clearImages: true,
  });

  beforeEach(async () => {
    // const testImage = await createTestImage();
    // testImageId = testImage._id;
    // request = testRequest();
  });
});
