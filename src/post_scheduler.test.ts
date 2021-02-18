import { PostError, scheduleNextPost } from "./post_scheduler";
import { database } from "./database";
import { Image } from "./database/images.model";
import { randomInt } from "./utils/random";
import { startOfToday, startOfTomorrow, startOfYesterday, add as date_add, set as date_set } from "date-fns";
import assert from "assert";
import { PostHistory } from "./database/post_history.model";
import { configuration } from "./config";
import { PostHistoryDocument, PostStatus } from "./database/post_history.types";

jest.mock("./utils/random", () => {
  return {
    randomInt: (min: number, max: number): number => {
      let val = 50;
      if (val < min) {
        val = min;
      }
      if (val >= max) {
        val = max - 1;
      }
      return val;
    }
  };
});

beforeAll(async () => {
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});

afterEach(() => {
  jest.clearAllMocks();
});

const RANDOM_VALUE = 50;

describe("mocks", () => {
  it("randomInt should be mocked", () => {
    expect(randomInt(5, 60)).toBe(RANDOM_VALUE);
  });
});

describe("test schedule component", () => {
  beforeEach(async () => {
    // clear posts and images
    await PostHistory.deleteMany();
    await Image.deleteMany();
  });

  describe("with no images", () => {
    it("should fail with no images error", async () => {
      const error = await getErrorPostResult(startOfToday());
      expect(error.message).toBe("no images");
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
      const now = date_add(startOfToday(), { hours: configuration.firstPostHour + 2 });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(newPost.timestamp).toStrictEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_add(startOfToday(), { hours: 18 });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), { minutes: RANDOM_VALUE, hours: configuration.firstPostHour });
      expect(newPost.timestamp).toStrictEqual(expected);
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
      const now = date_set(startOfToday(), { hours: configuration.firstPostHour + 3 });

      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(newPost.timestamp).toStrictEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_set(startOfToday(), { hours: 18 });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), { minutes: RANDOM_VALUE, hours: configuration.firstPostHour });
      expect(newPost.timestamp).toStrictEqual(expected);
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
      newPost.timestamp = date_set(startOfToday(), { hours: configuration.firstPostHour, minutes: 15 });
      await newPost.save();
    });

    it("should schedule a post tomorrow", async () => {
      // set current time to 11:00 AM
      const now = date_set(startOfToday(), { hours: configuration.firstPostHour + 3 });
      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after now due to injected random
      const expected = date_add(startOfTomorrow(), { hours: configuration.firstPostHour, minutes: RANDOM_VALUE });
      expect(newPost.timestamp).toStrictEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_set(startOfToday(), { hours: 18 });

      const newPost = await getOkPostResult(now);

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), { minutes: RANDOM_VALUE, hours: configuration.firstPostHour });
      expect(newPost.timestamp).toStrictEqual(expected);
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
      expect(newPost.timestamp).toStrictEqual(expected);
      expect(newPost.status.flag).toBe(PostStatus.PENDING);
    });
  });
});

async function getOkPostResult(now: Date): Promise<PostHistoryDocument> {
  const result = await scheduleNextPost(now);
  expect(result.isOk()).toBeTruthy();
  const newPost = result.value;
  assert(newPost instanceof PostHistory);
  return newPost;
}

async function getErrorPostResult(now: Date): Promise<PostError> {
  const result = await scheduleNextPost(now);
  expect(result.isError()).toBeTruthy();
  assert(result.isError());
  return result.value;
}