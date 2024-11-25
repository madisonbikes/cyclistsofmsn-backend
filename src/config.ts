import { initEnv } from "./utils/env";

initEnv();

const isDev = process.env.NODE_ENV === "development";

const parseIntWithDefault = (
  value: string | undefined,
  defaultValue: number,
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
  defaultValue: boolean,
): boolean => {
  let retval = defaultValue;
  if (value !== undefined) {
    retval = value.toLowerCase() === "true";
  }
  return retval;
};

export const testConfiguration = {
  reset() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "overrideConfigurationForTests should only be called in test environment",
      );
    }
    Object.assign(configuration, defaultConfiguration);
  },
  add(values: Partial<ServerConfiguration>) {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "overrideConfigurationForTests should only be called in test environment",
      );
    }
    Object.assign(configuration, values);
  },
};

const defaultConfiguration = {
  serverPort: parseIntWithDefault(process.env.PORT, 3001),
  photosDir: process.env.PHOTOS_DIR ?? "photos",
  reactStaticRootDir: process.env.STATIC_ROOT_DIR ?? "",
  mongodbUri:
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/cyclists_of_msn",
  firstPostHour: 8,
  lastPostHour: 16,
  twitterApiKey: process.env.TWITTER_API_KEY ?? "",
  twitterApiSecret: process.env.TWITTER_API_SECRET ?? "",
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN ?? "",
  twitterAccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "",
  mastodonUri: process.env.MASTODON_URI ?? "",
  mastodonAccessToken: process.env.MASTODON_ACCESS_TOKEN ?? "",
  mastodonStatusVisibility: process.env.MASTODON_STATUS_VISIBILITY,
  // used for session store
  redisSessionUri: process.env.REDIS_SESSION_URI ?? "",
  redisCacheUri: process.env.REDIS_CACHE_URI ?? "",
  sessionStoreSecret: process.env.SESSION ?? "notverysecret",
  secureCookie: parseBooleanWithDefault(process.env.SECURE_COOKIE, !isDev),
  trustProxy: parseBooleanWithDefault(process.env.TRUST_PROXY, false),
  enableCors: parseBooleanWithDefault(process.env.ENABLE_CORS, false),
  cronAuthorizationApiKey: process.env.CRON_AUTHORIZATION_APIKEY ?? "",
  atProtoUsername: process.env.ATPROTO_USERNAME ?? "",
  atProtoPassword: process.env.ATPROTO_PASSWORD ?? "",
};

export const configuration = { ...defaultConfiguration } as const;

export type ServerConfiguration = typeof defaultConfiguration;
