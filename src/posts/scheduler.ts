import { PostHistory, PostHistoryDocument, PostStatus } from "../database";
import {
  differenceInMinutes,
  startOfDay,
  set as date_set,
  add as date_add,
} from "date-fns";
import { ServerConfiguration } from "../config";
import {
  error,
  logger,
  NowProvider,
  ok,
  RandomProvider,
  Result,
} from "../utils";
import { injectable } from "tsyringe";
import { SchedulePostOptions } from "../routes/contract";
import { ImageSelector } from "./selection/selector";

export type PostResult = Result<PostHistoryDocument, PostError>;
export type PostError = { message: string };

@injectable()
export class PostScheduler {
  constructor(
    private randomProvider: RandomProvider,
    private nowProvider: NowProvider,
    private configuration: ServerConfiguration,
    private imageSelector: ImageSelector
  ) {}

  private lastScheduledPostTimestamp: number | undefined;

  /** returns the next post after scheduling or if it still needs to be posted */
  async schedulePost({
    when,
    selectImage,
    overwrite,
  }: SchedulePostOptions): Promise<PostResult> {
    const matchingPosts = await PostHistory.findScheduledPost(when);
    if (matchingPosts.length > 0) {
      if (!(overwrite ?? false)) {
        if (matchingPosts.length > 1) {
          logger.warn(
            {
              matchingPosts,
            },
            `More than one post scheduled for timestamp ${when}`
          );
        }
        const firstPost = matchingPosts[0];
        // to reduce log spam, only output this once even though we are polling every 5 minutes or so
        if (this.lastScheduledPostTimestamp !== firstPost.timestamp.getTime()) {
          logger.info(
            { when: firstPost.timestamp },
            "Using existing scheduled post"
          );
          this.lastScheduledPostTimestamp = firstPost.timestamp.getTime();
        }
        return ok(firstPost);
      }
      await Promise.all(matchingPosts.map((p) => p.delete()));
    }

    const createdPost = await this.createNewScheduledPost(when, selectImage);
    return createdPost.alsoOnOk((value) => {
      logger.info({ when: value.timestamp }, `Scheduled new post`);
    });
  }

  private async createNewScheduledPost(
    when: Date,
    selectImage = false
  ): Promise<PostResult> {
    const lastPost = await PostHistory.findLatestPost();
    const newPost = new PostHistory();

    const selectedTime = this.selectNextTime(lastPost?.timestamp, when);
    if (selectedTime.isError()) {
      // sometimes we can't schedule a new post today
      return error(selectedTime.value);
    }
    newPost.timestamp = selectedTime.value;
    newPost.status.flag = PostStatus.PENDING;
    if (selectImage) {
      const newImage = await this.imageSelector.nextImage();
      if (newImage.isOk()) {
        newPost.image = newImage.value;
      } else {
        return error(newImage.value);
      }
    }
    return ok(await newPost.save());
  }

  private selectNextTime(
    lastPostTime: Date | undefined,
    when: Date
  ): Result<Date, PostError> {
    const startOfToday = startOfDay(this.nowProvider.now());
    const startOfTomorrow = date_add(startOfToday, { days: 1 });
    const startOfPostDay = startOfDay(when);
    const lastTimeToday = date_set(startOfToday, {
      hours: this.configuration.lastPostHour,
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
      hours: this.configuration.firstPostHour,
    });
    const lastTime = date_set(startDate, {
      hours: this.configuration.lastPostHour,
    });

    const now = new Date(this.nowProvider.now());
    if (firstTime <= now) {
      firstTime = now;
    }
    const diff = Math.abs(differenceInMinutes(firstTime, lastTime));
    const random_min = this.randomProvider.randomInt(0, diff);

    // return
    return ok(date_add(firstTime, { minutes: random_min }));
  }
}
