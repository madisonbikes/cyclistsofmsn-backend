// noinspection JSUnusedLocalSymbols

import { setupSuite, testContainer } from "../../test";
import { Image, ImageDocument, PostHistory } from "../../database";
import {
  RepostCriteria,
  SeasonalityCriteria,
  UnpostedCriteria,
} from "./criteria";
import { addDays, startOfToday, subDays, subYears } from "date-fns";

describe("test criteria components", () => {
  setupSuite({ withDatabase: true });

  beforeEach(async () => {
    // clear posts and images
    await Promise.all([PostHistory.deleteMany(), Image.deleteMany()]);
  });

  describe("seasonality criteria", () => {
    it("before window", async () => {
      const testImage = await createImage(
        "testImage",
        subDays(startOfToday(), 50)
      );

      const criteria = testContainer().resolve(SeasonalityCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("before window, last year", async () => {
      const testImage = await createImage(
        "testImage",
        subYears(subDays(startOfToday(), 50), 1)
      );

      const criteria = testContainer().resolve(SeasonalityCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("after window", async () => {
      const testImage = await createImage(
        "testImage",
        addDays(startOfToday(), 50)
      );

      const criteria = testContainer().resolve(SeasonalityCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("within window", async () => {
      const testImage = await createImage(
        "testImage",
        addDays(startOfToday(), 5)
      );

      const criteria = testContainer().resolve(SeasonalityCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("within window, last year", async () => {
      const testImage = await createImage(
        "testImage",
        subYears(addDays(startOfToday(), 5), 1)
      );

      const criteria = testContainer().resolve(SeasonalityCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post of a different image, a month ago", async () => {
      const differentImage = await createImage("differentImage");
      const _post = await createPost(
        differentImage,
        subDays(startOfToday(), 30)
      );

      const testImage = await createImage();

      const criteria = testContainer().resolve(RepostCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });
  });

  describe("repost criteria", () => {
    it("no posts", async () => {
      const testImage = await createImage();

      const criteria = testContainer().resolve(RepostCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post a month ago", async () => {
      const testImage = await createImage();
      const _post = await createPost(testImage, subDays(startOfToday(), 30));

      const criteria = testContainer().resolve(RepostCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("one post a year ago", async () => {
      const testImage = await createImage();
      const _post = await createPost(testImage, subDays(startOfToday(), 365));

      const criteria = testContainer().resolve(RepostCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post of a different image, a month ago", async () => {
      const differentImage = await createImage("differentImage");
      const _post = await createPost(
        differentImage,
        subDays(startOfToday(), 30)
      );

      const testImage = await createImage();

      const criteria = testContainer().resolve(RepostCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });
  });

  describe("unposted criteria", () => {
    it("no posts", async () => {
      const testImage = await createImage();

      const criteria = testContainer().resolve(UnpostedCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });

    it("one post a month ago", async () => {
      const testImage = await createImage();
      const _post = await createPost(testImage, subDays(startOfToday(), 30));

      const criteria = testContainer().resolve(UnpostedCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeFalsy();
    });

    it("one post of a different image, a month ago", async () => {
      const differentImage = await createImage("differentImage");
      const _post = await createPost(
        differentImage,
        subDays(startOfToday(), 30)
      );

      const testImage = await createImage();

      const criteria = testContainer().resolve(UnpostedCriteria);
      return expect(criteria.satisfiedBy(testImage)).resolves.toBeTruthy();
    });
  });

  const createImage = (name = "testImage", exif_createdon?: Date) => {
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
});
