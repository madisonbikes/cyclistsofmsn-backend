import { setupSuite } from "../test/index.js";
import { createTestPosts } from "../test/data.js";
import { describe, it, expect } from "vitest";
import { imageModel } from "./database.js";

describe("database - posts", () => {
  setupSuite({ withDatabase: true });

  it("check that database layer returns default value for hidden", async () => {
    const { insertedImageId } = await createTestPosts();
    const image = await imageModel.findById(insertedImageId);
    expect(image).toBeDefined();
    expect(image?.hidden).toBeFalsy();
  });
});
