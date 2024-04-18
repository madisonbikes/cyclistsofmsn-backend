import { error, logger, ok, Result, safeAsyncWrapper } from "../utils";
import now from "../utils/now";
import { Cancellable, scheduleRepeat } from "../utils/simple_scheduler";
import { PostError, schedulePost } from "./postScheduler";
import postExecutor from "./postExecutor";
import {
  ImageDocument,
  PostHistoryDocument,
  PostStatus,
  Image,
} from "../database";
import imageSelector from "./selection/selector";
import imageRepositoryScanner from "../scan";

// five minutes
const DISPATCH_INTERVAL = 5 * 60 * 1000;
// five seconds
const DISPATCH_DELAY = 5 * 1000;

/**
 * The post dispatcher is responsible for orchestrating posting photos (runs every
 * five minutes or so after a five second delay)
 */
const scheduled: Array<Cancellable | undefined> = [];

function start(): void {
  scheduled.push(
    scheduleRepeat(
      safeAsyncWrapper("dispatch", asyncDispatch),
      DISPATCH_INTERVAL,
      DISPATCH_DELAY,
    ),
  );
}

function stop(): void {
  scheduled.forEach((v, ndx, array) => {
    v?.cancel();
    array[ndx] = undefined;
  });
}

// arrow function to preserve calling context
const asyncDispatch = async () => {
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
  const nextPost = scheduledResult.value;
  if (!isTimeToPost(nextPost)) {
    // not time to post
    return;
  }

  let postImage: ImageDocument | null = null;
  if (nextPost.image != null) {
    // use existing selected image, if it exists
    const id = nextPost.image._id;
    postImage = await Image.findById(id);
  }
  if (postImage == null) {
    logger.info("Scanning for new images");
    await imageRepositoryScanner.scan();

    // or generate a new image
    const checkImage = await selectImage();
    if (checkImage.isOk()) {
      postImage = checkImage.value;
    } else {
      nextPost.status.flag = PostStatus.FAILED;
      nextPost.status.error = checkImage.value.message;
    }
  }

  if (postImage != null) {
    // execute the post and then if it's sucessful, update the post status
    await postExecutor.post(postImage);

    nextPost.image = postImage;
    nextPost.status.flag = PostStatus.COMPLETE;
  }
  await nextPost.save();
};

/** returns true if it's time to execute this post, false if it's in the future */
function isTimeToPost(post: PostHistoryDocument) {
  const when = now() - post.timestamp.getTime();
  if (post.status.flag !== PostStatus.PENDING.toString()) {
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

export default { start, stop, selectImage };
