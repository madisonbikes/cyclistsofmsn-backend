import {
  assertError,
  NotVeryRandom,
  setupSuite,
  testContainer,
} from "../../test";
import { Image, ImageDocument, PostHistory } from "../../database";
import { ImageSelector } from "./selector";
import assert from "assert";
import { startOfToday, subDays } from "date-fns";
import { RandomProvider } from "../../utils";

describe("test post image selector components", () => {
  setupSuite({ withDatabase: true, clearPostHistory: true, clearImages: true });

  describe("selector", () => {
    it("fail with no image", async () => {
      const selector = buildSelector();
      const image = await selector.nextImage();
      assertError(image);
      expect(image.value.message).toEqual("no images");
    });

    it("succeed with one image", async () => {
      const image = await createImage();

      const selector = buildSelector();
      const post = await selector.nextImage();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value.id).toEqual(image.id);
    });

    it("pick unused image over a single used one", async () => {
      const image = await createImage();
      await createPost(image, subDays(startOfToday(), 1));

      const newImage = await createImage("newImage");

      const selector = buildSelector();
      const post = await selector.nextImage();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value.id).toEqual(newImage.id);
    });

    it("pick seasonal repost over non-seasonal unposted", async () => {
      const _nonSeasonalImage = await createImage(
        "nonSeasonalImage",
        subDays(startOfToday(), 60)
      );

      const seasonalImage = await createImage("seasonalImage");
      await createPost(seasonalImage, subDays(startOfToday(), 190));

      const selector = buildSelector();
      const image = await selector.nextImage();
      expect(image.isOk()).toBeTruthy();
      assert(image.isOk());
      expect(image.value.id).toEqual(seasonalImage.id);
    });

    it("fail with only hidden image", async () => {
      const hidden = await createImage("hiddenImage");
      hidden.hidden = true;
      await hidden.save();

      const selector = buildSelector();
      const image = await selector.nextImage();
      assertError(image);
      expect(image.value.message).toEqual("no images");
    });

    it("succeed with a hidden and non-hidden image", async () => {
      const hidden = await createImage("hiddenImage");
      hidden.hidden = true;
      await hidden.save();

      const normalImage = await createImage("normal");

      const selector = buildSelector();
      const image = await selector.nextImage();

      expect(image.isOk()).toBeTruthy();
      assert(image.isOk());
      expect(image.value.id).toEqual(normalImage.id);
    });
  });

  const createImage = (
    name = "testImage",
    exif_createdon: Date | undefined = startOfToday()
  ) => {
    const image = new Image();
    image.filename = name;
    image.exif_createdon = exif_createdon;
    return image.save();
  };

  const createPost = (image: ImageDocument, postDate: Date) => {
    const post = new PostHistory();
    post.image = image;
    post.timestamp = postDate;
    return post.save();
  };

  /** build post selector that uses deterministic RNG so testing is reliable */
  const buildSelector = () => {
    return testContainer()
      .createChildContainer()
      .register<RandomProvider>(RandomProvider, {
        useValue: new NotVeryRandom(101),
      })
      .resolve(ImageSelector);
  };
});
