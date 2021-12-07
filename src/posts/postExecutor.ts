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

  async post(): Promise<Result<ImageDocument, PostError>> {

    // first, scan repository for new images
    await this.repositoryScanner.start()

    // select image
    const nextImage = await this.postSelector.nextImage();
    if(nextImage.isError()) {
      logger.error(`Could not find an image to post: ${nextImage.value}`);
      return error(nextImage.value);
    }
    const result = await this.photoTweeter.post(nextImage.value);
    logger.info(`Posted new twitter post id ${result}`);
    return nextImage
  }
}