import { PostHistory, PostHistoryDocument, PostStatus } from "../database";
import date_set from "date-fns/set";
import date_add from "date-fns/add";
import { differenceInMinutes, startOfDay } from "date-fns";
import { ServerConfiguration } from "../config";
import { logger, NowProvider, ok, RandomProvider, Result } from "../utils";
import { injectable } from "tsyringe";

export type PostResult = Result<PostHistoryDocument, PostError>;
export type PostError = { message: string };

@injectable()
export class PostScheduler {
  constructor(
    private randomProvider: RandomProvider,
    private nowProvider: NowProvider,
    private configuration: ServerConfiguration
  ) {}

  private lastScheduledPostLog: string | undefined;

  /** returns the next post after scheduling or if it still needs to be posted */
  async scheduleNextPost(): Promise<PostResult> {
    const nextPost = await PostHistory.findNextScheduledPost();
    if (nextPost != null) {
      // to reduce log spam, only output this once even though we are polling every 5 minutes or so
      const newLog = `Using existing scheduled post @ ${nextPost.timestamp}`;
      if (this.lastScheduledPostLog !== newLog) {
        logger.info(newLog);
        this.lastScheduledPostLog = newLog;
      }
      return ok(nextPost);
    }

    const createdPost = await this.createNewScheduledPost();
    return createdPost.alsoOnOk((value) => {
      logger.info({ timestamp: value.timestamp }, `Scheduled new post`);
    });
  }

  private async createNewScheduledPost(): Promise<PostResult> {
    const lastPost = await PostHistory.findCurrentPost();
    const newPost = new PostHistory();
    newPost.timestamp = this.selectNextTime(lastPost?.timestamp);
    newPost.status.flag = PostStatus.PENDING;
    return ok(await newPost.save());
  }

  private selectNextTime(lastPostTime: Date | undefined): Date {
    const now = new Date(this.nowProvider.now());
    const startOfToday = startOfDay(now);
    const startOfTomorrow = date_add(startOfToday, { days: 1 });
    const lastTimeToday = date_set(startOfToday, {
      hours: this.configuration.lastPostHour,
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
      hours: this.configuration.firstPostHour,
    });
    const lastTime = date_set(startDate, {
      hours: this.configuration.lastPostHour,
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
