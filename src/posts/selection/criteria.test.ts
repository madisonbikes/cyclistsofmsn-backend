import { imageModel, postHistoryModel } from "../../database/database.js";
import type { DbImage } from "../../database/types.js";
import { setupSuite } from "../../test/index.js";
import {
  RepostCriteria,
  SeasonalityCriteria,
  UnpostedCriteria,
} from "./criteria.js";
import { addDays, startOfToday, subDays, subYears } from "date-fns";
import { describe, it, expect } from "vitest";

describe("test criteria components", () => {
  setupSuite({ withDatabase: true, clearPostHistory: true, clearImages: true });

  describe("seasonality criteria", () => {
    it("before window", async () => {
      const testImage = await createImage("testImage", {
        exif_createdon: subDays(startOfToday(), 50),
      });

      const criteria = new SeasonalityCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("before window, last year", async () => {
      const testImage = await createImage("testImage", {
        exif_createdon: subYears(subDays(startOfToday(), 50), 1),
      });

      const criteria = new SeasonalityCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("after window", async () => {
      const testImage = await createImage("testImage", {
        exif_createdon: addDays(startOfToday(), 50),
      });

      const criteria = new SeasonalityCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("within window", async () => {
      const testImage = await createImage("testImage", {
        exif_createdon: addDays(startOfToday(), 5),
      });

      const criteria = new SeasonalityCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("within window, last year", async () => {
      const testImage = await createImage("testImage", {
        exif_createdon: subYears(addDays(startOfToday(), 5), 1),
      });

      const criteria = new SeasonalityCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post of a different image, a month ago", async () => {
      const differentImage = await createImage("differentImage");
      const _post = await createPost(
        differentImage,
        subDays(startOfToday(), 30),
      );

      const testImage = await createImage();

      const criteria = new RepostCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });
  });

  describe("repost criteria", () => {
    it("no posts", async () => {
      const testImage = await createImage();

      const criteria = new RepostCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post a month ago", async () => {
      const testImage = await createImage();
      const _post = await createPost(testImage, subDays(startOfToday(), 30));

      const criteria = new RepostCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("one post a year ago", async () => {
      const testImage = await createImage();
      const _post = await createPost(testImage, subDays(startOfToday(), 365));

      const criteria = new RepostCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post of a different image, a month ago", async () => {
      const differentImage = await createImage("differentImage");
      const _post = await createPost(
        differentImage,
        subDays(startOfToday(), 30),
      );

      const testImage = await createImage();

      const criteria = new RepostCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });
  });

  describe("unposted criteria", () => {
    it("no posts", async () => {
      const testImage = await createImage();

      const criteria = new UnpostedCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post a month ago", async () => {
      const testImage = await createImage();
      const _post = await createPost(testImage, subDays(startOfToday(), 30));

      const criteria = new UnpostedCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("one post of a different image, a month ago", async () => {
      const differentImage = await createImage("differentImage");
      const _post = await createPost(
        differentImage,
        subDays(startOfToday(), 30),
      );

      const testImage = await createImage();

      const criteria = new UnpostedCriteria();
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });
  });

  const createImage = (name = "testImage", extra: Partial<DbImage> = {}) => {
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
