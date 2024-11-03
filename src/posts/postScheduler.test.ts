import { assertError, assertInstanceOf, assertOk, setupSuite } from "../test";
import { PostError, schedulePost } from "./postScheduler";
import {
  add as date_add,
  set as date_set,
  startOfToday,
  startOfTomorrow,
  startOfYesterday,
} from "date-fns";
import {
  Image,
  PostHistory,
  PostHistoryDocument,
  PostStatus,
} from "../database";
import { configuration } from "../config";
import { SchedulePostOptions } from "../routes/contract";
import now from "../utils/now";
import { ObjectId } from "mongodb";

jest.mock("../utils/random");
jest.mock("../utils/now");
const mockNow = jest.mocked(now);

const RANDOM_VALUE = 50;

describe("test schedule component", () => {
  setupSuite({ withDatabase: true, clearImages: true, clearPostHistory: true });

  describe("with no images", () => {
    it("should succeed, will fail at actual posting time", async function () {
      // set current time to 10:00 AM
      const now = date_add(startOfToday(), {
        hours: configuration.firstPostHour + 2,
      });
      const newPost = await getOkPostResult({ when: now });
      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(JSON.stringify(newPost.timestamp)).toEqual(
        JSON.stringify(expected),
      );
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
        hours: configuration.firstPostHour + 2,
      });
      const newPost = await getOkPostResult({ when: now });

      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(JSON.stringify(newPost.timestamp)).toEqual(
        JSON.stringify(expected),
      );
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_add(startOfToday(), { hours: 18 });
      const error = await getErrorPostResult({ when: now });
      expect(error.message).toContain("Posting closed for today");

      const tomorrow = date_add(startOfToday(), { days: 1, hours: 1 });
      const newPost = await getOkPostResult({ when: tomorrow });

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), {
        minutes: RANDOM_VALUE,
        hours: configuration.firstPostHour,
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
      newPost.image = newImage._id;
      newPost.status.flag = PostStatus.COMPLETE;
      newPost.timestamp = date_set(startOfYesterday(), { hours: 10 });
      await newPost.save();
    });

    it("should schedule a post today", async () => {
      // set current time to 10:00 AM
      const now = date_set(startOfToday(), {
        hours: configuration.firstPostHour + 3,
      });

      const newPost = await getOkPostResult({ when: now });

      // expected is 50 minutes after now due to injected random
      const expected = date_add(now, { minutes: RANDOM_VALUE });
      expect(newPost.timestamp).toEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const now = date_set(startOfToday(), { hours: 18 });
      const error = await getErrorPostResult({ when: now });
      expect(error.message).toContain("Posting closed for today");

      const tomorrow = date_add(startOfToday(), { days: 1, hours: 1 });
      const newPost = await getOkPostResult({ when: tomorrow });

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), {
        minutes: RANDOM_VALUE,
        hours: configuration.firstPostHour,
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
      newPost.image = newImage._id;
      newPost.status.flag = PostStatus.COMPLETE;
      newPost.timestamp = date_set(startOfToday(), {
        hours: configuration.firstPostHour,
        minutes: 15,
      });
      await newPost.save();
    });

    it("should schedule a post tomorrow", async () => {
      // set current time to 11:00 AM
      const now = date_set(startOfToday(), {
        hours: configuration.firstPostHour + 3,
      });
      const error = await getErrorPostResult({ when: now });
      expect(error.message).toContain("Already posted today");

      const tomorrow = date_add(startOfToday(), { days: 1, hours: 1 });
      const newPost = await getOkPostResult({ when: tomorrow });

      // expected is 50 minutes after now due to injected random
      const expected = date_add(startOfTomorrow(), {
        hours: configuration.firstPostHour,
        minutes: RANDOM_VALUE,
      });
      expect(newPost.timestamp).toEqual(expected);
    });

    it("should schedule a post tomorrow if we missed window", async () => {
      // set current time to 6:00 PM
      const today = date_set(startOfToday(), { hours: 18 });
      const error = await getErrorPostResult({ when: today });
      expect(error.message).toContain("Posting closed for today");

      const tomorrow = date_add(startOfToday(), { days: 1, hours: 1 });
      const newPost = await getOkPostResult({ when: tomorrow });

      // expected is 50 minutes after earliest time (8am) due to injected random
      const expected = date_set(startOfTomorrow(), {
        minutes: RANDOM_VALUE,
        hours: configuration.firstPostHour,
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
      newPost.image = newImage._id;
      newPost.status.flag = PostStatus.PENDING;
      newPost.timestamp = date_set(startOfToday(), { hours: 10, minutes: 15 });
      await newPost.save();
    });

    it("should do nothing", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const newPost = await getOkPostResult({ when: now });

      const expected = date_add(startOfToday(), { hours: 10, minutes: 15 });
      expect(newPost.timestamp).toEqual(expected);
      expect(newPost.status.flag).toEqual(PostStatus.PENDING);
    });

    it("should do nothing at 8:15, then at 10:30 it should generate the next post", async () => {
      // set current time to 8:15 AM
      const now_815 = date_set(startOfToday(), { hours: 8, minutes: 15 });
      mockNow.mockReturnValue(now_815.getTime());

      let result = await schedulePost({ when: now_815 });
      assertOk(result);
      let { value: newPost } = result;
      assertInstanceOf(newPost, PostHistory);
      expect(newPost.status.flag).toEqual(PostStatus.PENDING);

      // do the post
      newPost.status.flag = PostStatus.COMPLETE;
      await newPost.save();

      const now_1015 = date_add(startOfToday(), {
        hours: 10,
        minutes: 15,
      });

      result = await schedulePost({ when: now_1015 });
      assertError(result);
      expect(result.value.message).toEqual("Already posted today");

      mockNow.mockReturnValue(
        date_set(startOfToday(), {
          hours: 10,
          minutes: 30,
        }).getTime(),
      );

      result = await schedulePost({ when: now_1015 });
      assertError(result);
      expect(result.value.message).toEqual("Already posted today");

      const tomorrow = date_add(startOfTomorrow(), { hours: 8, minutes: 50 });
      result = await schedulePost({ when: tomorrow });
      assertOk(result);

      newPost = result.value;
      assertInstanceOf(newPost, PostHistory);
      expect(newPost.status.flag).toEqual(PostStatus.PENDING);
    });
  });

  describe("image selection options", () => {
    let imageId: ObjectId;

    beforeEach(async () => {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();
      imageId = newImage._id;
    });

    it("successfully select image", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      mockNow.mockReturnValue(now.getTime());

      const result = await schedulePost({
        when: now,
        selectImage: true,
      });
      assertOk(result);
      const id = result.value.image?._id;
      expect(id).toEqual(imageId);
    });

    it("successfully defer image selection", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      mockNow.mockReturnValue(now.getTime());

      const result = await schedulePost({
        when: now,
        selectImage: false,
      });
      assertOk(result);
      expect(result.value.image).not.toBeDefined();
    });
  });

  describe("multiple posts", () => {
    it("successfully schedule multiples", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      mockNow.mockReturnValue(now.getTime());

      let result = await schedulePost({
        when: now,
      });
      assertOk(result);

      const tomorrow = date_add(now, { days: 1 });
      result = await schedulePost({
        when: tomorrow,
      });
      assertOk(result);
    });

    it("won't overwrite", async () => {
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const result1 = await getOkPostResult({ when: now });
      const result2 = await getOkPostResult({ when: now });
      expect(result1.id).toEqual(result2.id);
    });

    it("will overwrite", async () => {
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const result1 = await getOkPostResult({ when: now });
      const result2 = await getOkPostResult({ when: now, overwrite: true });
      expect(result1.id).not.toEqual(result2.id);
    });
  });

  const getOkPostResult = async (
    options: SchedulePostOptions,
  ): Promise<PostHistoryDocument> => {
    mockNow.mockReturnValue(options.when.getTime());
    const result = await schedulePost(options);
    assertOk(result);
    const newPost = result.value;
    assertInstanceOf(newPost, PostHistory);
    return newPost;
  };

  const getErrorPostResult = async (
    options: SchedulePostOptions,
  ): Promise<PostError> => {
    mockNow.mockReturnValue(options.when.getTime());
    const result = await schedulePost(options);
    assertError(result);
    return result.value;
  };
});
