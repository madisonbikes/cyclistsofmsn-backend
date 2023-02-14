import { injectable, singleton } from "tsyringe";
import { initEnv } from "./utils/env";

initEnv();

const DEFAULT_SERVER_PORT = 3001;

@injectable()
@singleton()
export class ServerConfiguration {
  public readonly serverPort;
  public readonly photosDir = process.env.PHOTOS_DIR ?? "photos";
  public readonly reactStaticRootDir = process.env.STATIC_ROOT_DIR ?? "";
  public readonly mongodbUri =
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/cyclists_of_msn";
  public readonly firstPostHour = 8;
  public readonly lastPostHour = 16;

  public readonly twitterApiKey = process.env.TWITTER_API_KEY ?? "";
  public readonly twitterApiSecret = process.env.TWITTER_API_SECRET ?? "";
  public readonly twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN ?? "";
  public readonly twitterAccessTokenSecret =
    process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "";

  public readonly mastodonUri = process.env.MASTODON_URI ?? "";
  public readonly mastodonAccessToken = process.env.MASTODON_ACCESS_TOKEN ?? "";
  public readonly mastodonStatusVisibility =
    process.env.MASTODON_STATUS_VISIBILITY;

  public readonly redisUri = process.env.REDIS_URI ?? "";

  public readonly sessionStoreSecret =
    process.env.SESSION_STORE_SECRET ?? "notverysecret";

  // note that logging configuration is handled in util/logger.ts
  constructor() {
    const port = process.env.PORT;
    if (port === undefined || !port) {
      // blank or undefined
      this.serverPort = `${DEFAULT_SERVER_PORT}`;
    } else {
      this.serverPort = port;
    }
  }
}
