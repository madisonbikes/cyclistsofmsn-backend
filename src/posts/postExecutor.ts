import photoTooter from "../mastodon/post.js";
import photoTweeter from "../twitter/post.js";
import atproto from "../atproto/index.js";
import { logger } from "../utils/index.js";
import type { DbImage } from "../database/types.js";

/** responsible for actually posting photos */
async function post(image: DbImage) {
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
        image.description ?? undefined,
      );
      logger.info({ id: result }, `Posted new Mastodon post`);
    } catch (e) {
      logger.error(e, "Error posting to Mastodon");
    }
  }
  if (atproto.isEnabled()) {
    try {
      logger.debug("ATProto enabled");
      const result = await atproto.post(
        image.filename,
        image.description ?? "",
      );
      logger.info({ result }, `Posted new ATProto post`);
    } catch (e) {
      logger.error(e, "Error posting to ATProto");
    }
  }
}
export default { post };
