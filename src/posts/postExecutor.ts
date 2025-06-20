import * as photoTooter from "../mastodon/post";
import * as photoTweeter from "../twitter/post";
import * as atproto from "../atproto";
import { logger } from "../utils";
import type { DbImage } from "../database/types";

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
