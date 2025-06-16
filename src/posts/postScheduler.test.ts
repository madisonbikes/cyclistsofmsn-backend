import { assertError, assertOk, setupSuite } from "../test";
import { type PostError, schedulePost } from "./postScheduler";
import {
  add as date_add,
  set as date_set,
  startOfToday,
  startOfTomorrow,
  startOfYesterday,
} from "date-fns";
import { configuration } from "../config";
import { type SchedulePostOptions } from "../routes/contract";
import now from "../utils/now";
import { ObjectId } from "mongodb";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { database, imageModel, postHistoryModel } from "../database/database";
import type { DbPostHistory } from "../database/types";

vi.mock("../utils/random");
vi.mock("../utils/now");
const mockNow = vi.mocked(now);

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
      await imageModel.insertOne({ filename: "blarg" });
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
      const newImage = await imageModel.insertOne({ filename: "blarg" });

      await postHistoryModel.insertOne({
        status: { flag: "complete" },
        timestamp: date_set(startOfYesterday(), { hours: 10 }),
        image: newImage._id,
      });
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
      const newImage = await imageModel.insertOne({ filename: "blarg" });

      await postHistoryModel.insertOne({
        status: { flag: "complete" },
        timestamp: date_set(startOfToday(), {
          hours: configuration.firstPostHour,
          minutes: 15,
        }),
        image: newImage._id,
      });
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
      const newImage = await imageModel.insertOne({ filename: "blarg" });

      await postHistoryModel.insertOne({
        status: { flag: "pending" },
        timestamp: date_set(startOfToday(), { hours: 10, minutes: 15 }),
        image: newImage._id,
      });
    });

    it("should do nothing", async () => {
      // set current time to 8:15 AM
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const newPost = await getOkPostResult({ when: now });

      const expected = date_add(startOfToday(), { hours: 10, minutes: 15 });
      expect(newPost.timestamp).toEqual(expected);
      expect(newPost.status.flag).toEqual("pending");
    });

    it("should do nothing at 8:15, then at 10:30 it should generate the next post", async () => {
      // set current time to 8:15 AM
      const now_815 = date_set(startOfToday(), { hours: 8, minutes: 15 });
      mockNow.mockReturnValue(now_815.getTime());

      let result = await schedulePost({ when: now_815 });
      assertOk(result);
      const { value: newlyScheduledPost } = result;
      expect(newlyScheduledPost).toMatchObject({
        status: { flag: "pending" },
        populatedImage: {
          deleted: false,
          description_from_exif: true,
          filename: "blarg",
          hidden: false,
        },
      });
      expect(newlyScheduledPost._id).toBeDefined();

      // do the post
      await database.posts.updateOne(
        { _id: newlyScheduledPost._id },
        { $set: { status: { flag: "complete" } } },
      );

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

      const { value: secondScheduledPost } = result;
      expect(secondScheduledPost.status.flag).toEqual("pending");
    });
  });

  describe("image selection options", () => {
    let imageId: ObjectId;

    beforeEach(async () => {
      const inserted = await imageModel.insertOne({
        filename: "blarg",
      });
      imageId = inserted._id;
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
      const id = result.value.populatedImage?._id;
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
      expect(result.value.populatedImage).toBeUndefined();
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
      expect(result1._id).toEqual(result2._id);
    });

    it("will overwrite", async () => {
      const now = date_set(startOfToday(), { hours: 8, minutes: 15 });
      const result1 = await getOkPostResult({ when: now });
      const result2 = await getOkPostResult({ when: now, overwrite: true });
      expect(result1._id).not.toEqual(result2._id);
    });
  });

  const getOkPostResult = async (
    options: SchedulePostOptions,
  ): Promise<DbPostHistory> => {
    mockNow.mockReturnValue(options.when.getTime());
    const result = await schedulePost(options);
    assertOk(result);
    const newPost = result.value;
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
