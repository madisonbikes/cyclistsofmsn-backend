import { assertError, assertInstanceOf, assertOk, MutableNow, NotVeryRandom, setupSuite, testContainer } from "../test";
import { PostError, PostScheduler } from "./scheduler";
import { add as date_add, set as date_set, startOfToday, startOfTomorrow, startOfYesterday } from "date-fns";
import { Image, PostHistory, PostHistoryDocument, PostStatus } from "../database";
import { NowProvider, RandomProvider } from "../utils";
import { ServerConfiguration } from "../config";

const RANDOM_VALUE = 50;

describe("test schedule component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(async () => {
    // clear posts and images
    await PostHistory.deleteMany();
    await Image.deleteMany();
  });

  describe("with no images", () => {
    it("should fail with no images error", async function() {
      const error = await getErrorPostResult(startOfToday());
      expect(error.message).toEqual("no images");
    });
  });

  describe("with no posts", () => {
    beforeEach(async () => {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();
    });

    it("should schedule a post today", async () => {
      // set current time to 10:00 AM
      const now = date_add(startOfToday(), {
        hours: configuration().firstPostHour + 2
      });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(JSON.stringify(newPost.timestamp)).toEqual(JSON.stringify(expected));
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_add(startOfToday(), { hours: 18 });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), {
        minutes: RANDOM_VALUE,
        hours: configuration().firstPostHour
      });
      expect(newPost.timestamp).toEqual(expected);
    });
  });

  describe("with existing post yesterday at 10:00 AM", () => {
    beforeEach(async () => {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();

      const newPost = new PostHistory();
      newPost.image = newImage.id;
      newPost.status.flag = PostStatus.COMPLETE;
      newPost.timestamp = date_set(startOfYesterday(), { hours: 10 });
      await newPost.save();
    });

    it("should schedule a post today", async () => {
      // set current time to 10:00 AM
      const now = date_set(startOfToday(), {
        hours: configuration().firstPostHour + 3
      });

      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(newPost.timestamp).toEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_set(startOfToday(), { hours: 18 });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), {
        minutes: RANDOM_VALUE,
        hours: configuration().firstPostHour
      });
      expect(newPost.timestamp).toEqual(expected);
    });
  });

  describe("with existing post today at 8:15", () => {
    beforeEach(async () => {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();

      const newPost = new PostHistory();
      newPost.image = newImage.id;
      newPost.status.flag = PostStatus.COMPLETE;
      newPost.timestamp = date_set(startOfToday(), {
        hours: configuration().firstPostHour,
        minutes: 15
      });
      await newPost.save();
    });

    it("should schedule a post tomorrow", async () => {
      // set current time to 11:00 AM
      const now = date_set(startOfToday(), {
        hours: configuration().firstPostHour + 3
      });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after now due to injected random
      const expected = date_add(startOfTomorrow(), {
        hours: configuration().firstPostHour,
        minutes: RANDOM_VALUE
      });
      expect(newPost.timestamp).toEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_set(startOfToday(), { hours: 18 });

      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), {
        minutes: RANDOM_VALUE,
        hours: configuration().firstPostHour
      });
      expect(newPost.timestamp).toEqual(expected);
    });
  });

  describe("with pending post today at 10:15", () => {
    beforeEach(async () => {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();

      const newPost = new PostHistory();
      newPost.image = newImage.id;
      newPost.status.flag = PostStatus.PENDING;
      newPost.timestamp = date_set(startOfToday(), { hours: 10, minutes: 15 });
      await newPost.save();
    });

    it("should do nothing", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const newPost = await getOkPostResult(now);

      const expected = date_add(startOfToday(), { hours: 10, minutes: 15 });
      expect(newPost.timestamp).toEqual(expected);
      expect(newPost.status.flag).toEqual(PostStatus.PENDING);
    });

    it("should do nothing at 8:15, then at 10:30 it should generate the next post", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const nowProvider = new MutableNow(now);
      const scheduler = await buildScheduler(nowProvider);
      let newPostResult = await scheduler.scheduleNextPost();
      assertOk(newPostResult);
      let { value: newPost } = newPostResult;
      assertInstanceOf(newPost, PostHistory);

      let expected = date_add(startOfToday(), { hours: 10, minutes: 15 });
      expect(newPost.timestamp).toEqual(expected);
      expect(newPost.status.flag).toEqual(PostStatus.PENDING);

      // do the post
      newPost.status.flag = PostStatus.COMPLETE;
      await newPost.save();

      nowProvider.when = date_set(startOfToday(), { hours: 10, minutes: 30 }).getTime();
      newPostResult = await scheduler.scheduleNextPost();
      assertOk(newPostResult);
      newPost = newPostResult.value;
      assertInstanceOf(newPost, PostHistory);

      // post tomorrow
      expected = date_add(startOfTomorrow(), { hours: 8, minutes: 50 });
      expect(newPost.timestamp).toEqual(expected);
      expect(newPost.status.flag).toEqual(PostStatus.PENDING);
    });
  });

  async function getOkPostResult(now: Date): Promise<PostHistoryDocument> {
    const result = await buildScheduler(now).scheduleNextPost();
    assertOk(result);
    const newPost = result.value;
    assertInstanceOf(newPost, PostHistory);
    return newPost;
  }

  async function getErrorPostResult(now: Date): Promise<PostError> {
    const result = await buildScheduler(now).scheduleNextPost();
    assertError(result);
    return result.value;
  }

  /** build a scheduler based on a specific time stamp or mutable now */
  function buildScheduler(now: MutableNow | Date) {
    if (now instanceof Date) {
      now = new MutableNow(now);
    }
    return testContainer()
      .createChildContainer()
      .register<RandomProvider>(RandomProvider, { useValue: new NotVeryRandom(RANDOM_VALUE) })
      .register<NowProvider>(NowProvider, { useValue: now })
      .resolve(PostScheduler);
  }

  function configuration(): ServerConfiguration {
    return testContainer().resolve(ServerConfiguration);
  }
});
