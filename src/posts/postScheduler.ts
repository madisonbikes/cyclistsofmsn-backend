import { postHistoryModel } from "../database";
import {
  differenceInMinutes,
  startOfDay,
  set as date_set,
  add as date_add,
} from "date-fns";
import { configuration } from "../config";
import { error, logger, ok, type Result } from "../utils";
import { randomInt } from "../utils/random";
import now from "../utils/now";
import { type SchedulePostOptions } from "../routes/contract";
import imageSelector from "./selection/selector";
import type {
  DbImage,
  DbPopulatedPostHistory,
  DbPostHistory,
} from "../database/types";

type PostResult = Result<DbPopulatedPostHistory, PostError>;

export interface PostError {
  message: string;
  critical?: boolean;
}

let suppressDuplicateLogMessage: number | undefined;

/** returns the next post after scheduling or if it still needs to be posted */
export const schedulePost = async ({
  when,
  selectImage,
  overwrite = false,
}: SchedulePostOptions): Promise<PostResult> => {
  const matchingPosts = await postHistoryModel.findScheduledPost(when);
  if (overwrite) {
    // just delete all matching posts and redo them
    await Promise.all(
      matchingPosts.map((p) => postHistoryModel.deleteOne(p._id)),
    );
  } else if (matchingPosts.length > 1) {
    logger.warn(
      {
        matchingPosts,
        when,
      },
      "More than one post scheduled for timestamp",
    );
  } else if (matchingPosts.length === 1) {
    // normal case, return existing post
    const firstPost = matchingPosts[0];
    // to reduce log spam, only output this once even though we are polling every 5 minutes or so
    if (suppressDuplicateLogMessage !== firstPost.timestamp.getTime()) {
      logger.info(
        { when: firstPost.timestamp },
        "Using existing scheduled post",
      );
      suppressDuplicateLogMessage = firstPost.timestamp.getTime();
    }
    return ok(firstPost);
  } else {
    // no matching posts so we can create a new one
  }

  // now we can create a new post
  const createdPost = await createNewScheduledPost(when, selectImage);
  return createdPost.alsoOnOk((value) => {
    logger.info({ when: value.timestamp }, `Scheduled new post`);
  });
};

const createNewScheduledPost = async (
  when: Date,
  selectImage = false,
): Promise<PostResult> => {
  const lastPost = await postHistoryModel.findLatestPost();

  const selectedTime = selectNextTime(lastPost?.timestamp, when);
  if (selectedTime.isError()) {
    // sometimes we can't schedule a new post today
    return error(selectedTime.value);
  }
  const newPost: Omit<DbPostHistory, "_id"> = {
    status: { flag: "pending" },
    timestamp: selectedTime.value,
  };
  let image: DbImage | undefined;
  if (selectImage) {
    const newImage = await imageSelector.nextImage();
    if (newImage.isOk()) {
      newPost.image = newImage.value._id;
      image = newImage.value;
    } else {
      return error(newImage.value);
    }
  }
  const insertedPost = await postHistoryModel.insertOne(newPost);
  return ok({ ...insertedPost, populatedImage: image });
};

const selectNextTime = (
  lastPostTime: Date | undefined,
  when: Date,
): Result<Date, PostError> => {
  const startOfToday = startOfDay(now());
  const startOfTomorrow = date_add(startOfToday, { days: 1 });
  const startOfPostDay = startOfDay(when);
  const lastTimeToday = date_set(startOfToday, {
    hours: configuration.lastPostHour,
  });

  let startDate: Date;
  if (startOfPostDay >= startOfTomorrow) {
    // scheduling for future date
    startDate = startOfPostDay;
  } else {
    // rest of logic deals with scheduling posts on same day
    if (when >= lastTimeToday) {
      // no more posts today
      return error({ message: "Posting closed for today" });
    } else if (lastPostTime != null) {
      // there are previous posts
      if (lastPostTime > startOfToday) {
        // we already posted today
        return error({ message: "Already posted today" });
      } else {
        // still need to post today
        startDate = startOfToday;
      }
    } else {
      // no posts at all, post today
      startDate = startOfToday;
    }
  }
  let firstTime = date_set(startDate, {
    hours: configuration.firstPostHour,
  });
  const lastTime = date_set(startDate, {
    hours: configuration.lastPostHour,
  });

  const actualNow = new Date(now());
  if (firstTime <= actualNow) {
    firstTime = actualNow;
  }
  const diff = Math.abs(differenceInMinutes(firstTime, lastTime));
  const random_min = randomInt(0, diff);

  // return
  return ok(date_add(firstTime, { minutes: random_min }));
};
