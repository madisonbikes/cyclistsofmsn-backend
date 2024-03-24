import {
  error,
  Lifecycle,
  logger,
  ok,
  Result,
  safeAsyncWrapper,
} from "../utils";
import now from "../utils/now";
import { Cancellable, scheduleRepeat } from "../utils/simple_scheduler";
import { PostError, postScheduler } from "./postScheduler";
import { postExecutor } from "./postExecutor";
import {
  ImageDocument,
  PostHistoryDocument,
  PostStatus,
  Image,
} from "../database";
import { imageSelector } from "./selection/selector";
import { imageRepositoryScanner } from "../scan";

/** dispatch posts every five minutes */
const DISPATCH_INTERVAL = 5 * 60 * 1000;
const DISPATCH_DELAY = 5 * 1000;

/**
 * The post dispatcher is responsible for orchestrating posting photos.
 */
export class PostDispatcher implements Lifecycle {
  private scheduled: Array<Cancellable | undefined> = [];

  start(): void {
    this.scheduled.push(
      scheduleRepeat(
        safeAsyncWrapper("dispatch", this.asyncDispatch),
        DISPATCH_INTERVAL,
        DISPATCH_DELAY,
      ),
    );
  }

  stop(): void {
    this.scheduled.forEach((v, ndx, array) => {
      v?.cancel();
      array[ndx] = undefined;
    });
  }

  // because this method is called by reference above, it must be an arrow function
  // or the "this" is lost!
  asyncDispatch = async () => {
    const scheduledResult = await postScheduler.schedulePost({
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
    if (!this.isTimeToPost(nextPost)) {
      // not time to post
      return;
    }

    let postImage: ImageDocument | null = null;
    if (nextPost.image != null) {
      // use existing selected image, if it exists
      const { id } = nextPost.image;
      postImage = await Image.findById(id);
    }
    if (postImage == null) {
      // or generate a new image
      const checkImage = await this.selectImage();
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
  private isTimeToPost(post: PostHistoryDocument) {
    const when = now() - post.timestamp.getTime();
    if (post.status.flag !== PostStatus.PENDING) {
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

  private async selectImage(): Promise<Result<ImageDocument, PostError>> {
    // first, scan repository for new images
    // FIXME This doesn't do what you think it does ben
    await imageRepositoryScanner.start();

    // select image
    const retval = await imageSelector.nextImage();
    if (retval.isError()) {
      logger.warn({ error: retval.value }, `Could not find an image to post`);
      return error(retval.value);
    } else {
      return ok(retval.value);
    }
  }
}

export const postDispatcher = new PostDispatcher();
