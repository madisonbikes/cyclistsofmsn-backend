import { error, logger, ok, Result } from "../utils";
import now from "../utils/now";
import { PostError, schedulePost } from "./postScheduler";
import postExecutor from "./postExecutor";
import { ImageDocument, PostHistoryDocument, PostHistory } from "../database";
import imageSelector from "./selection/selector";
import imageRepositoryScanner from "../scan";

// five minutes
const DISPATCH_INTERVAL = 5 * 60 * 1000;

/**
 * The post dispatcher is responsible for orchestrating posting photos. It should be run every five minutes or so.
 */

export const dispatchPostOnSchedule = async () => {
  const scheduledResult = await schedulePost({
    when: new Date(now()),
    selectImage: true,
  });
  if (scheduledResult.isError()) {
    if (scheduledResult.value.critical === true) {
      logger.warn(
        { message: scheduledResult.value.message },
        `Error, no post scheduled`,
      );
    } else {
      logger.debug(
        { message: scheduledResult.value.message },
        `No post scheduled`,
      );
    }
    return;
  }
  const nextScheduledPost = scheduledResult.value;
  if (!isTimeToPost(nextScheduledPost)) {
    // not time to post
    return;
  }

  if (nextScheduledPost.populatedImage != null) {
    // use existing selected image, if it exists
    await postExecutor.post(nextScheduledPost.populatedImage);
    await PostHistory.updatePostStatus(nextScheduledPost._id, {
      flag: "complete",
    });
  } else {
    // no image selected, we need to select one
    logger.info("Scanning for new images");
    await imageRepositoryScanner.scan();

    // or generate a new image
    const checkImage = await selectImage();
    if (checkImage.isOk()) {
      // execute the post and then if it's sucessful, update the post status
      await postExecutor.post(checkImage.value);
      await PostHistory.updatePostStatus(nextScheduledPost._id, {
        flag: "complete",
      });
    } else {
      await PostHistory.updatePostStatus(nextScheduledPost._id, {
        flag: "failed",
        error: checkImage.value.message,
      });
    }
  }
};

/** returns true if it's time to execute this post, false if it's in the future */
function isTimeToPost(post: PostHistoryDocument) {
  const when = now() - post.timestamp.getTime();
  if (post.status.flag !== "pending") {
    logger.warn({ post }, "isTimeToPost expects PENDING posts only");
    return false;
  }

  if (when <= 0) {
    // post dated in future, it's not time to post
    return false;
  }

  if (when > DISPATCH_INTERVAL) {
    logger.info(
      `Missed scheduled post ${Math.abs(
        Math.round(when / 1000 / 60),
      )} minutes ago, sending immediately.`,
    );
  } else {
    logger.info("Sending scheduled post on schedule");
  }
  return true;
}

async function selectImage(): Promise<Result<ImageDocument, PostError>> {
  // select image
  const retval = await imageSelector.nextImage();
  if (retval.isError()) {
    logger.warn({ error: retval.value }, `Could not find an image to post`);
    return error(retval.value);
  } else {
    return ok(retval.value);
  }
}
