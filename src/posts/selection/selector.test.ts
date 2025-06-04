import { assertError, setupSuite } from "../../test";
import { Image, ImageDocument, PostHistory } from "../../database";
import assert from "assert";
import { startOfToday, subDays } from "date-fns";
import imageSelector from "./selector";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../utils/random");

describe("test post image selector components", () => {
  setupSuite({ withDatabase: true, clearPostHistory: true, clearImages: true });

  describe("selector", () => {
    it("fail with no image", async () => {
      const image = await imageSelector.nextImage();
      assertError(image);
      expect(image.value.message).toEqual("no images");
    });

    it("succeed with one image", async () => {
      const image = await createImage();

      const post = await imageSelector.nextImage();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value._id).toEqual(image._id);
    });

    it("pick unused image over a single used one", async () => {
      const image = await createImage();
      await createPost(image, subDays(startOfToday(), 1));

      const newImage = await createImage("newImage");

      const post = await imageSelector.nextImage();
      expect(post.isOk()).toBeTruthy();
      assert(post.isOk());
      expect(post.value._id).toEqual(newImage._id);
    });

    it("pick seasonal repost over non-seasonal unposted", async () => {
      const _nonSeasonalImage = await createImage(
        "nonSeasonalImage",
        subDays(startOfToday(), 60),
      );

      const seasonalImage = await createImage("seasonalImage");
      await createPost(seasonalImage, subDays(startOfToday(), 190));

      const image = await imageSelector.nextImage();
      expect(image.isOk()).toBeTruthy();
      assert(image.isOk());
      expect(image.value._id).toEqual(seasonalImage._id);
    });

    it("fail with only hidden image", async () => {
      const hidden = await createImage("hiddenImage");
      hidden.hidden = true;
      await hidden.save();

      const image = await imageSelector.nextImage();
      assertError(image);
      expect(image.value.message).toEqual("no images");
    });

    it("succeed with a hidden and non-hidden image", async () => {
      const hidden = await createImage("hiddenImage");
      hidden.hidden = true;
      await hidden.save();

      const normalImage = await createImage("normal");

      const image = await imageSelector.nextImage();

      expect(image.isOk()).toBeTruthy();
      assert(image.isOk());
      expect(image.value._id).toEqual(normalImage._id);
    });
  });

  const createImage = (
    name = "testImage",
    exif_createdon: Date | undefined = startOfToday(),
  ) => {
    const image = new Image();
    image.filename = name;
    image.exif_createdon = exif_createdon;
    return image.save();
  };

  const createPost = (image: ImageDocument, postDate: Date) => {
    const post = new PostHistory();
    post.image = image._id;
    post.timestamp = postDate;
    return post.save();
  };
});
