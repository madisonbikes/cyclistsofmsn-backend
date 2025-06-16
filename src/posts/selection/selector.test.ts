import { assertError, setupSuite } from "../../test/index.ts";
import imageSelector from "./selector.ts";
import assert from "assert";
import { startOfToday, subDays } from "date-fns";
import { vi, describe, it, expect } from "vitest";
import type { DbImage } from "../../database/types.ts";
import { imageModel, postHistoryModel } from "../../database/database.ts";

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
      expect(post.isOk()).toEqual(true);
      assert(post.isOk());
      expect(post.value._id).toEqual(image._id);
    });

    it("pick unused image over a single used one", async () => {
      const image = await createImage();
      await createPost(image, subDays(startOfToday(), 1));

      const newImage = await createImage("newImage");

      const post = await imageSelector.nextImage();
      expect(post.isOk()).toEqual(true);
      assert(post.isOk());
      expect(post.value._id).toEqual(newImage._id);
    });

    it("pick seasonal repost over non-seasonal unposted", async () => {
      const _nonSeasonalImage = await createImage("nonSeasonalImage", {
        exif_createdon: subDays(startOfToday(), 60),
      });

      const seasonalImage = await createImage("seasonalImage");
      await createPost(seasonalImage, subDays(startOfToday(), 190));

      const image = await imageSelector.nextImage();
      expect(image.isOk()).toEqual(true);
      assert(image.isOk());
      expect(image.value._id).toEqual(seasonalImage._id);
    });

    it("fail with only hidden image", async () => {
      const _hidden = await createImage("hiddenImage", { hidden: true });

      const image = await imageSelector.nextImage();
      assertError(image);
      expect(image.value.message).toEqual("no images");
    });

    it("succeed with a hidden and non-hidden image", async () => {
      const _hidden = await createImage("hiddenImage", { hidden: true });

      const normalImage = await createImage("normal");

      const image = await imageSelector.nextImage();

      expect(image.isOk()).toEqual(true);
      assert(image.isOk());
      expect(image.value._id).toEqual(normalImage._id);
    });
  });

  const createImage = (
    name = "testImage",
    extra: Partial<DbImage> = { exif_createdon: startOfToday() },
  ) => {
    return imageModel.insertOne({
      filename: name,
      ...extra,
    });
  };

  const createPost = (image: DbImage, postDate: Date) => {
    return postHistoryModel.insertOne({
      image: image._id,
      timestamp: postDate,
      status: { flag: "pending" },
    });
  };
});
