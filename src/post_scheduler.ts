import { Image, ImageDocument, PostHistory, PostHistoryDocument, PostStatus } from "./database";
import date_set from "date-fns/set";
import date_add from "date-fns/add";
import { differenceInMinutes, startOfDay } from "date-fns/fp";
import { ServerConfiguration } from "./config";
import { error, logger, NowProvider, ok, RandomProvider, Result } from "./utils";
import { injectable } from "tsyringe";

export type PostResult = Result<PostHistoryDocument, PostError>;
export type PostError = { message: string };

@injectable()
export class PostScheduler {
  constructor(
    private random: RandomProvider,
    private now: NowProvider,
    private configuration: ServerConfiguration
  ) {
  }

  async scheduleNextPost(): Promise<PostResult> {
    const nextPost = await PostHistory.findNextScheduledPost();
    if (nextPost != null) {
      logger.info(`Using existing scheduled post @ ${nextPost.timestamp}`);
      return ok(nextPost);
    }

    const createdPost = await this.createNewScheduledPost();
    if (createdPost.isOk()) {
      logger.info(`Scheduled new post @ ${createdPost.value.timestamp}`);
    }
    return createdPost;
  }

  private async createNewScheduledPost(): Promise<PostResult> {
    const [lastPost, newImage] = await Promise.all([
      PostHistory.findCurrentPost(),
      this.selectNextPhoto()
    ]);
    const newPost = new PostHistory();
    if (newImage.isError()) {
      return error(newImage.value);
    }
    newPost.image = newImage.value;
    newPost.timestamp = await this.selectNextTime(lastPost?.timestamp);
    newPost.status.flag = PostStatus.PENDING;
    return ok(await newPost.save());
  }

  private async selectNextPhoto(): Promise<Result<ImageDocument, PostError>> {
    const allImages = await Image.find().where({ deleted: false });
    if (allImages.length == 0) {
      return error({ message: "no images" });
    }
    const randomIndex = this.random.randomInt(0, allImages.length);
    return ok(allImages[randomIndex]);
  }

  private async selectNextTime(lastPostTime: Date | undefined): Promise<Date> {
    const startOfToday = startOfDay(this.now.now());
    const startOfTomorrow = date_add(startOfToday, { days: 1 });
    const lastTimeToday = date_set(startOfToday, {
      hours: this.configuration.lastPostHour
    });

    let startDate: Date;
    if (this.now.now() >= lastTimeToday) {
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

    if (firstTime <= this.now.now()) {
      firstTime = this.now.now();
    }
    const diff = Math.abs(differenceInMinutes(firstTime, lastTime));
    const random_min = this.random.randomInt(0, diff);

    // return
    return date_add(firstTime, { minutes: random_min });
  }
}
