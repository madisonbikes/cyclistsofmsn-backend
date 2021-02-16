import { PostHistory } from "./database/post_history.model";
import { PostHistoryDocument, PostStatus } from "./database/post_history.types";
import { ImageDocument } from "./database/images.types";
import { Image } from "./database/images.model";
import { randomInt } from "crypto";
import date_set from "date-fns/set";
import date_add from "date-fns/add";
import startOfToday from "date-fns/startOfToday";
import { differenceInMinutes, isFuture, startOfTomorrow } from "date-fns";
import { configuration } from "./config";
import assert from "assert";
import { Either, left, right } from "./utils/either";
import { Cancellable, schedule } from "./utils/simple_scheduler";
import { logger } from "./utils/logger";

type PostError = { message: string }

export async function scheduleNextPost(now = new Date()): Promise<boolean> {
  let nextPost = await PostHistory.findNextScheduledPost();
  if (!nextPost) {
    const createdPost = await createNewScheduledPost(now);
    if (createdPost.isRight()) {
      logger.error("No scheduled post", createdPost.value);
      return false;
    }
    nextPost = createdPost.value;
    logger.info(`Scheduled new post @ ${nextPost.timestamp}`);
  } else {
    logger.info(`Using existing scheduled post @ ${nextPost.timestamp}`);
  }
  await nextPost
    .populate("image")
    .execPopulate();
  assert(nextPost.image instanceof Image);

  clearSchedule();

  let when = nextPost.timestamp.getTime() - Date.now();
  if (when <= 0) {
    logger.info(`Missed scheduled post ${Math.abs(Math.round(when / 1000 / 60))} minutes ago, running in one minute`);
    when = 60 * 1000;
  } else {
    logger.info(`Scheduling post of ${nextPost.image.filename} in ${Math.round(when / 1000 / 60)} minutes`);
  }
  scheduledPost = schedule(createPostFn(now, nextPost), when);
  return true;
}

export function clearSchedule(): void {
  if (scheduledPost) {
    scheduledPost.cancel();
    scheduledPost = undefined;
  }
}

let scheduledPost: Cancellable | undefined;

function createPostFn(now: Date, post: PostHistoryDocument) {
  return async () => {
    assert(post.image instanceof Image);
    logger.info(`Posting ${post.image.filename} a new twitter!`);
    post.status.flag = PostStatus.COMPLETE;
    await post.save();

    // do the next post now
    await scheduleNextPost(now);
  };
}

async function createNewScheduledPost(now: Date): Promise<Either<PostHistoryDocument, PostError>> {
  const [lastPost, newImage] = await Promise.all([
    PostHistory.findCurrentPost(),
    selectNextPhoto()
  ]);
  const newPost = new PostHistory();
  if (newImage.isRight()) {
    return right(newImage.value);
  }
  newPost.image = newImage.value;
  newPost.timestamp = await selectNextTime(lastPost?.timestamp, now);
  newPost.status.flag = PostStatus.PENDING;
  return left(await newPost.save());
}

async function selectNextPhoto(): Promise<Either<ImageDocument, PostError>> {
  const allImages = await Image.find().where({ deleted: false });
  if (allImages.length == 0) {
    return right({ message: "no images" });
  }
  const randomIndex = randomInt(0, allImages.length);
  return left(allImages[randomIndex]);
}

async function selectNextTime(lastPostTime: Date | undefined, now: Date): Promise<Date> {
  const lastTimeToday = date_set(startOfToday(), { hours: configuration.lastPostHour });

  let startDate: Date;
  if (lastPostTime) {
    if (lastPostTime > startOfToday()) {
      // we already posted today
      startDate = startOfTomorrow();
    } else {
      // still need to post today
      startDate = startOfToday();
    }
  } else {
    if (now > lastTimeToday) {
      // can't post today any more, post tomorrow
      startDate = startOfTomorrow();
    } else {
      // post today
      startDate = startOfToday();
    }
  }
  let firstTime = date_set(startDate, { hours: configuration.firstPostHour });
  const lastTime = date_set(startDate, { hours: configuration.lastPostHour });

  if (!isFuture(firstTime)) {
    firstTime = now;
  }
  const diff = Math.abs(differenceInMinutes(firstTime, lastTime));
  const random_min = randomInt(0, diff);

  // return
  return date_add(firstTime, { minutes: random_min });
}