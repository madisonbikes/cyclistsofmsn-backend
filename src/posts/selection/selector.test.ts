import { setupSuite, testContainer } from "../../test";
import { Image, ImageDocument, PostHistory } from "../../database";
import { PostSelector } from "./selector";

describe("test post image selector components", () => {
  setupSuite({ withDatabase: true });

  beforeEach(async () => {
    // clear posts and images
    await Promise.all([
      PostHistory.deleteMany(),
      Image.deleteMany()
    ]);
  });

  describe("selector", () => {
    it("start", async () => {
      await createImage()

      const selector = testContainer().resolve(PostSelector);
      const post = await selector.nextPost();

      const post2 = await selector.nextPost();
      expect(post.isOk()).toBeTruthy();
    });

    it("start", async () => {
      await createImage()

      const selector = testContainer().resolve(PostSelector);
      const post = await selector.nextPost();
      expect(post.isOk()).toBeTruthy();
    });
  });

  async function createImage(name = "testImage", exif_createdon?: Date) {
    const image = new Image();
    image.filename = name;
    image.exif_createdon = exif_createdon;
    return image.save();
  }

  async function createPost(image: ImageDocument, postDate: Date) {
    const post = new PostHistory();
    post.image = image;
    post.timestamp = postDate;
    return post.save();
  }
});