import { Cancellable, Lifecycle, logger, NowProvider, SimpleScheduler } from "../utils";
import { PostStatus } from "../database";
import { PostScheduler } from "./scheduler";
import { injectable } from "tsyringe";

/** check every five minutes */
const CHECK_INTERVAL = 5 * 60 * 1000;
const DELAY = 5 * 1000;

@injectable()
export class PostDispatcher implements Lifecycle {
  private scheduled: Cancellable | undefined;

  constructor(private scheduler: PostScheduler, private nowProvider: NowProvider,
              private simpleScheduler: SimpleScheduler) {
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
        await nextPost
          .populate("image")
          .execPopulate();

        logger.info(`Posting ${nextPost.image} a new twitter!`);
        nextPost.status.flag = PostStatus.COMPLETE;
        await nextPost.save();
        if (when > CHECK_INTERVAL) {
          logger.info(`Missed scheduled post ${Math.abs(Math.round(when / 1000 / 60))} minutes ago, running immediately.`);
        } else {
          logger.info("Running scheduled post on schedule");
        }
      }
    } catch (e) {
      logger.error(e);
      return;
    }
  }
}
