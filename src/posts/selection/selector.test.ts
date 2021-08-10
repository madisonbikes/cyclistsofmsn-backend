import { NotVeryRandom, setupSuite, testContainer } from "../../test";
import { Image, ImageDocument, PostHistory } from "../../database";
import { PostSelector } from "./selector";
import assert from "assert";
import { startOfToday, subDays } from "date-fns";
import { RandomProvider } from "../../utils";

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
    it("fail with no image", async () => {
      const selector = buildSelector();
      const post = await selector.nextPost();
      expect(post.isError()).toBeTruthy();
    });

    it("succeed with one image", async () => {
      const image = await createImage();

      const selector = buildSelector();
      const post = await selector.nextPost();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value.id).toEqual(image.id);
    });

    it("pick unused image over a single used one", async () => {
      const image = await createImage();
      await createPost(image, subDays(startOfToday(), 1));

      const newImage = await createImage("newImage");

      const selector = buildSelector();
      const post = await selector.nextPost();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value.id).toEqual(newImage.id);
    });

    it("pick seasonal repost over non-seasonal unposted", async () => {
      const nonSeasonalImage = await createImage("nonSeasonalImage", subDays(startOfToday(), 60));

      const seasonalImage = await createImage("seasonalImage");
      await createPost(seasonalImage, subDays(startOfToday(), 190));

      const selector = buildSelector();
      const post = await selector.nextPost();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value.id).toEqual(seasonalImage.id);
    });
  });


  async function createImage(name = "testImage", exif_createdon: Date | undefined = startOfToday()) {
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

  /** build post selector that uses deterministic RNG so testing is reliable */
  function buildSelector() {
    return testContainer()
      .createChildContainer()
      .register<RandomProvider>(RandomProvider, { useValue: new NotVeryRandom(101) })
      .resolve(PostSelector);
  }
});