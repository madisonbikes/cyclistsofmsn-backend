import { Cancellable, Lifecycle, logger, NowProvider, SimpleScheduler } from "../utils";
import { ImageDocument, PostStatus } from "../database";
import { PostScheduler } from "./scheduler";
import { injectable } from "tsyringe";
import { PhotoTwitterClient } from "../twitter/post";
import { isDocument } from "@typegoose/typegoose";

/** check every five minutes */
const CHECK_INTERVAL = 5 * 60 * 1000;
const DELAY = 5 * 1000;

@injectable()
export class PostDispatcher implements Lifecycle {
  private scheduled: Cancellable | undefined;

  constructor(private scheduler: PostScheduler,
              private nowProvider: NowProvider,
              private simpleScheduler: SimpleScheduler,
              private photoTweeter: PhotoTwitterClient) {
  }

  start(): void {
    this.scheduled = this.simpleScheduler.scheduleRepeat(async () => {
      return this.checkTimeToPost();
    }, CHECK_INTERVAL, DELAY);
  }

  stop(): void {
    this.scheduled?.cancel();
    this.scheduled = undefined;
  }

  private async doPost(image: ImageDocument) {
    const result = await this.photoTweeter.post(image);
    logger.info(`Posted new twitter post id ${result}`);
  }

  /** async function is fine for setInterval(), but it should never throw an exception */
  private async checkTimeToPost() {
    try {
      const scheduledResult = await this.scheduler.scheduleNextPost();
      if (scheduledResult.isError()) {
        logger.error("Error scheduling post", scheduledResult.value);
        return;
      }
      const nextPost = scheduledResult.value;
      const when = this.nowProvider.now() - nextPost.timestamp.getTime();
      if (when > 0) {
        if (when > CHECK_INTERVAL) {
          logger.info(`Missed scheduled post ${Math.abs(Math.round(when / 1000 / 60))} minutes ago, sending immediately.`);
        } else {
          logger.info("Sending scheduled post on schedule");
        }
        await nextPost
          .populate("image")
          .execPopulate();
        if (!isDocument(nextPost.image)) {
          logger.error("nextPost.image should be populated");
          return;
        }
        await this.doPost(nextPost.image);
        nextPost.status.flag = PostStatus.COMPLETE;
        await nextPost.save();
      }
    } catch (e) {
      logger.error(e);
      return;
    }
  }
}
