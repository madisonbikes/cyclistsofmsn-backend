import { setupSuite } from "../test/index.js";
import { createTestPosts } from "../test/data.js";
import { Image } from "./images.js";

describe("database - posts", () => {
  setupSuite({ withDatabase: true });

  it("check that typegoose layer returns default value for hidden", async () => {
    const { insertedImageId } = await createTestPosts();
    const image = await Image.findById(insertedImageId);
    expect(image).toBeDefined();
    expect(image?.hidden).toBeFalsy();
  });
});
