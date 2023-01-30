import { injectable } from "tsyringe";
import { PhotoTwitterClient } from "../twitter/post";
import { ImageDocument } from "../database";
import { logger } from "../utils";
import { PhotoMastadonClient } from "../mastadon/post";

/** responsible for actually posting photos */
@injectable()
export class PostExecutor {
  constructor(
    private photoTweeter: PhotoTwitterClient,
    private photoTooter: PhotoMastadonClient
  ) {}

  async post(image: ImageDocument) {
    if (this.photoTweeter.isEnabled()) {
      try {
        logger.debug("Twitter enabled");
        const result = await this.photoTweeter.post(image.filename);
        logger.info({ id: result }, `Posted new Twitter post`);
      } catch (e) {
        logger.error(e, "Error posting tweet");
      }
    }
    if (this.photoTooter.isEnabled()) {
      try {
        logger.debug("Mastadon enabled");
        const result = await this.photoTooter.post(
          image.filename,
          image.description
        );
        logger.info({ id: result }, `Posted new Mastadon post`);
      } catch (e) {
        logger.error(e, "Error posting to Mastadon");
      }
    }
  }
}
