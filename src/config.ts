import { injectable, singleton } from "tsyringe";
import { initEnv } from "./utils/env";

initEnv();

const isDev = process.env.NODE_ENV === "development";

@injectable()
@singleton()
export class ServerConfiguration {
  public readonly serverPort = parseIntWithDefault(process.env.PORT, 3001);
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

  public readonly secureCookie = parseBooleanWithDefault(
    process.env.SECURE_COOKIE,
    !isDev
  );

  public readonly trustProxy = parseBooleanWithDefault(
    process.env.TRUST_PROXY,
    false
  );

  public readonly enableCors = parseBooleanWithDefault(
    process.env.ENABLE_CORS,
    false
  );

  // note that logging configuration is handled in util/logger.ts
  constructor() {
    // empty
  }
}

const parseIntWithDefault = (
  value: string | undefined,
  defaultValue: number
): number => {
  let retval = defaultValue;
  if (value !== undefined) {
    retval = Number(value);
    if (isNaN(retval)) {
      retval = defaultValue;
    }
  }
  return retval;
};

const parseBooleanWithDefault = (
  value: string | undefined,
  defaultValue: boolean
): boolean => {
  let retval = defaultValue;
  if (value !== undefined) {
    retval = value.toLowerCase() === "true";
  }
  return retval;
};
