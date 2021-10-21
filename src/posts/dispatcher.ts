import { Cancellable, Lifecycle, logger, NowProvider, SimpleScheduler } from "../utils";
import { PostScheduler } from "./scheduler";
import { injectable } from "tsyringe";
import { PostExecutor } from "./postExecutor";
import { PostStatus } from "../database";

/** check every five minutes */
const CHECK_INTERVAL = 5 * 60 * 1000;
const DELAY = 5 * 1000;

@injectable()
export class PostDispatcher implements Lifecycle {
  private scheduled: Cancellable | undefined;

  constructor(private scheduler: PostScheduler,
              private nowProvider: NowProvider,
              private simpleScheduler: SimpleScheduler,
              private executor: PostExecutor
  ) {
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
        if (when > CHECK_INTERVAL) {
          logger.info(`Missed scheduled post ${Math.abs(Math.round(when / 1000 / 60))} minutes ago, sending immediately.`);
        } else {
          logger.info("Sending scheduled post on schedule");
        }
      }
      // execute the post and then if it's sucessful, update the post status
      const postedImage = await this.executor.post()
      if(postedImage.isOk()) {
        nextPost.image = postedImage.value
        nextPost.status.flag = PostStatus.COMPLETE;
      } else {
        nextPost.status.error = postedImage.value.message
      }
      await nextPost.save();
    } catch (e) {
      logger.error(e);
      return;
    }
  }
}
