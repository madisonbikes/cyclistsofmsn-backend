import { setupSuite } from "../test";
import { createTestPosts } from "../test/data";
import { Image } from "./images";

describe("database - posts", () => {
  setupSuite({ withDatabase: true });

  it("check that typegoose layer returns default value for hidden", async () => {
    const { insertedImageId } = await createTestPosts();
    const image = await Image.findById(insertedImageId);
    expect(image).toBeDefined();
    expect(image?.hidden).toBeFalsy();
  });
});
