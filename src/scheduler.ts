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
import { Either, left, right } from "./either";

type PostError = { message: string }

export async function scheduleNextPost(): Promise<void> {
  let scheduledPost = await PostHistory.findNextScheduledPost();
  if (!scheduledPost) {
    const newPost = await createNewScheduledPost();
    if(newPost.isRight()) {
      console.error(`No scheduled post: ${newPost.value}`);
      return;
    }
    scheduledPost = newPost.value
    console.log(`Scheduled new post @ ${scheduledPost.timestamp}`);
  } else {
    console.log(`Using existing scheduled post @ ${scheduledPost.timestamp}`);
  }
  scheduledPost = await scheduledPost
    .populate("image")
    .execPopulate();
  assert(scheduledPost.image instanceof Image);

  nextScheduledPost = scheduledPost;
  const when = scheduledPost.timestamp.getTime() - Date.now();
  if (when <= 0) {
    console.log(`Missed scheduled post ${Math.abs(Math.round(when / 1000 / 60))} minutes ago, running in one minute`);
    setTimeout(doPost, 1000 * 60);
  } else {
    console.log(`Scheduling post of ${scheduledPost.image.filename} in ${Math.round(when / 1000 / 60)} minutes`);
    setTimeout(doPost, when);
  }

}

let nextScheduledPost: PostHistoryDocument | undefined;
async function doPost() {
  if (!nextScheduledPost) return;

  assert(nextScheduledPost.image instanceof Image);
  console.log(`Posting ${nextScheduledPost.image.filename} a new twitter!`);
  nextScheduledPost.status.flag = PostStatus.COMPLETE;
  await nextScheduledPost.save();

  nextScheduledPost = undefined;
  // do the next post now
  await scheduleNextPost();
}

async function createNewScheduledPost(): Promise<Either<PostHistoryDocument, PostError>> {
  const [lastPost, newImage] = await Promise.all([
    PostHistory.findCurrentPost(),
    selectNextPhoto()
  ]);
  const newPost = new PostHistory();
  if (newImage.isRight()) {
    return right(newImage.value);
  }
  newPost.image = newImage.value;
  newPost.timestamp = await selectNextTime(lastPost?.timestamp);
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

async function selectNextTime(lastPostTime: Date | undefined): Promise<Date> {
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
    if (new Date() > lastTimeToday) {
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
    firstTime = new Date();
  }
  const diff = Math.abs(differenceInMinutes(firstTime, lastTime));
  const random_min = randomInt(0, diff);

  // return
  return date_add(firstTime, { minutes: random_min });
}