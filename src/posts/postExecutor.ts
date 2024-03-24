import { ImageDocument } from "../database";
import { photoTooter } from "../mastodon/post";
import { photoTweeter } from "../twitter/post";
import { logger } from "../utils";

/** responsible for actually posting photos */
export class PostExecutor {
  async post(image: ImageDocument) {
    if (photoTweeter.isEnabled()) {
      try {
        logger.debug("Twitter enabled");
        const result = await photoTweeter.post(image.filename);
        logger.info({ id: result }, `Posted new Twitter post`);
      } catch (e) {
        logger.error(e, "Error posting tweet");
      }
    }
    if (photoTooter.isEnabled()) {
      try {
        logger.debug("Mastodon enabled");
        const result = await photoTooter.post(
          image.filename,
          image.description,
        );
        logger.info({ id: result }, `Posted new Mastodon post`);
      } catch (e) {
        logger.error(e, "Error posting to Mastodon");
      }
    }
  }
}

export const postExecutor = new PostExecutor();
