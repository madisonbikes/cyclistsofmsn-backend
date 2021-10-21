import { injectable } from "tsyringe";
import { PostError } from "./scheduler";
import { PhotoTwitterClient } from "../twitter/post";
import { ImageSelector } from "./selection/selector";
import { ImageRepositoryScanner } from "../scan";
import { ImageDocument, PostHistoryDocument, PostStatus } from "../database";
import { error, logger, ok, Result } from "../utils";


@injectable()
export class PostExecutor {
  constructor(private photoTweeter: PhotoTwitterClient,
              private postSelector: ImageSelector,
              private repositoryScanner: ImageRepositoryScanner) {
  }

  async execute(post: PostHistoryDocument): Promise<Result<PostHistoryDocument, PostError>> {

    // first, scan repository for new images
    await this.repositoryScanner.start()

    // select image
    const nextImage = await this.postSelector.nextImage();
    if(nextImage.isError()) {
      logger.error(`Could not find an image to post: ${nextImage.value}`);
      return error(nextImage.value);
    }
    await this.doPost(nextImage.value);
    post.image = nextImage.value
    post.status.flag = PostStatus.COMPLETE;
    return ok(post)
  }

  private async doPost(image: ImageDocument) {
    const result = await this.photoTweeter.post(image);
    logger.info(`Posted new twitter post id ${result}`);
  }
}