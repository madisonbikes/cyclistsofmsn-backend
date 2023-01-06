import { injectable } from "tsyringe";
import { PostError } from "./scheduler";
import { PhotoTwitterClient } from "../twitter/post";
import { ImageSelector } from "./selection/selector";
import { ImageRepositoryScanner } from "../scan";
import { ImageDocument } from "../database";
import { error, logger, Result } from "../utils";
import { PhotoMastadonClient } from "../mastadon/post";

@injectable()
export class PostExecutor {
  constructor(
    private photoTweeter: PhotoTwitterClient,
    private photoTooter: PhotoMastadonClient,
    private postSelector: ImageSelector,
    private repositoryScanner: ImageRepositoryScanner
  ) {}

  async post(): Promise<Result<ImageDocument, PostError>> {
    // first, scan repository for new images
    await this.repositoryScanner.start();

    // select image
    const nextImage = await this.postSelector.nextImage();
    if (nextImage.isError()) {
      logger.error(
        `Could not find an image to post: ${nextImage.value.message}`
      );
      return error(nextImage.value);
    }
    if (this.photoTweeter.isEnabled()) {
      try {
        logger.debug("Twitter enabled");
        const result = await this.photoTweeter.post(nextImage.value.filename);
        logger.info(`Posted new Twitter post id ${JSON.stringify(result)}`);
      } catch (e) {
        logger.error("Error posting tweet");
        logger.error(e);
      }
    }
    if (this.photoTooter.isEnabled()) {
      try {
        logger.debug("Mastadon enabled");
        const result = await this.photoTooter.post(nextImage.value.filename);
        logger.info(`Posted new Mastadon post id ${JSON.stringify(result)}`);
      } catch (e) {
        logger.error("Error posting to Mastadon");
        logger.error(e);
      }
    }
    return nextImage;
  }
}
