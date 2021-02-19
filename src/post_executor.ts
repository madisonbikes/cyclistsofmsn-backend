import { logger } from "./utils/logger";
import assert from "assert";
import { Image } from "./database/images.model";
import { PostStatus } from "./database/post_history.types";
import { PostScheduler } from "./post_scheduler";
import { container } from "tsyringe";

/** check every five minutes */
const CHECK_INTERVAL = 5 * 60 * 1000;

let timeout: NodeJS.Timeout | undefined;

export function startExecutor(): void {
  setTimeout(checkTimeToPost, 10 * 1000);
  timeout = setInterval(checkTimeToPost, CHECK_INTERVAL);
}

export function stopExecutor(): void {
  if (timeout != null) {
    clearInterval(timeout);
    timeout = undefined;
  }
}

/** async function is fine for setInterval(), but it should never throw an exception */
async function checkTimeToPost() {
  try {
    const scheduler = container.resolve(PostScheduler)
    const scheduledResult = await scheduler.scheduleNextPost();
    if (scheduledResult.isError()) {
      logger.error("Error scheduling post", scheduledResult.value);
      return;
    }
    const nextPost = scheduledResult.value;
    const when = Date.now() - nextPost.timestamp.getTime();
    if (when > 0) {
      await nextPost
        .populate("image")
        .execPopulate();

      assert(nextPost.image instanceof Image);
      logger.info(`Posting ${nextPost.image.filename} a new twitter!`);
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
