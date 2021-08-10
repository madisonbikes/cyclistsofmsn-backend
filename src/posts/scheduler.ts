import { PostHistory, PostHistoryDocument, PostStatus } from "../database";
import date_set from "date-fns/set";
import date_add from "date-fns/add";
import { differenceInMinutes, startOfDay } from "date-fns/fp";
import { ServerConfiguration } from "../config";
import { error, logger, NowProvider, ok, RandomProvider, Result } from "../utils";
import { injectable } from "tsyringe";
import { PostSelector } from "./selection/selector";

export type PostResult = Result<PostHistoryDocument, PostError>;
export type PostError = { message: string };

@injectable()
export class PostScheduler {
  constructor(
    private randomProvider: RandomProvider,
    private nowProvider: NowProvider,
    private configuration: ServerConfiguration,
    private postSelector: PostSelector
  ) {
  }

  /** returns the next post after scheduling or if it still needs to be posted */
  async scheduleNextPost(): Promise<PostResult> {
    const nextPost = await PostHistory.findNextScheduledPost();
    if (nextPost != null) {
      logger.info(`Using existing scheduled post @ ${nextPost.timestamp}`);
      return ok(nextPost);
    }

    const createdPost = await this.createNewScheduledPost()
    return createdPost.alsoOnOk(value => {
      logger.info(`Scheduled new post @ ${value.timestamp}`);
    })
  }

  private async createNewScheduledPost(): Promise<PostResult> {
    const [lastPost, newImage] = await Promise.all([
      PostHistory.findCurrentPost(),
      this.postSelector.nextPost()
    ]);
    if(newImage.isError()) {
      return error(newImage.value)
    }
    const newPost = new PostHistory();
    newPost.image = newImage.value;
    newPost.timestamp = await this.selectNextTime(lastPost?.timestamp);
    newPost.status.flag = PostStatus.PENDING;
    return ok(await newPost.save());
  }

  private async selectNextTime(lastPostTime: Date | undefined): Promise<Date> {
    const now = new Date(this.nowProvider.now());
    const startOfToday = startOfDay(now);
    const startOfTomorrow = date_add(startOfToday, { days: 1 });
    const lastTimeToday = date_set(startOfToday, {
      hours: this.configuration.lastPostHour
    });

    let startDate: Date;
    if (now >= lastTimeToday) {
      // no more posts today
      startDate = startOfTomorrow;
    } else if (lastPostTime != null) {
      // there are previous posts
      if (lastPostTime > startOfToday) {
        // we already posted today
        startDate = startOfTomorrow;
      } else {
        // still need to post today
        startDate = startOfToday;
      }
    } else {
      // no posts at all, post today
      startDate = startOfToday;
    }
    let firstTime = date_set(startDate, {
      hours: this.configuration.firstPostHour
    });
    const lastTime = date_set(startDate, {
      hours: this.configuration.lastPostHour
    });

    if (firstTime <= now) {
      firstTime = now;
    }
    const diff = Math.abs(differenceInMinutes(firstTime, lastTime));
    const random_min = this.randomProvider.randomInt(0, diff);

    // return
    return date_add(firstTime, { minutes: random_min });
  }
}
