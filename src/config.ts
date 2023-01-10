import { injectable, singleton } from "tsyringe";
import { initEnv } from "./utils/env";

initEnv();

const DEFAULT_SERVER_PORT = 3001;

export type JwtConfiguration = {
  secret: string;
  issuer: string;
  audience: string;
  expiresIn: string;
};

@injectable()
@singleton()
export class ServerConfiguration {
  public readonly serverPort = process.env.PORT || `${DEFAULT_SERVER_PORT}`;
  public readonly photosDir = process.env.PHOTOS_DIR || "photos";
  public readonly reactStaticRootDir?: string = process.env.STATIC_ROOT_DIR;
  public readonly mongodbUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/cyclists_of_msn";
  public readonly firstPostHour = 8;
  public readonly lastPostHour = 16;

  public readonly twitterApiKey = process.env.TWITTER_API_KEY || "";
  public readonly twitterApiSecret = process.env.TWITTER_API_SECRET || "";
  public readonly twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN || "";
  public readonly twitterAccessTokenSecret =
    process.env.TWITTER_ACCESS_TOKEN_SECRET || "";

  public readonly mastadonUri = process.env.MASTADON_URI || "";
  public readonly mastadonAccessToken = process.env.MASTADON_ACCESS_TOKEN || "";
  public readonly mastadonStatusVisibility =
    process.env.MASTADON_STATUS_VISIBILITY;

  public readonly jwt: JwtConfiguration;

  // note that logging configuration is handled in util/logger.ts

  constructor() {
    this.jwt = {
      secret: process.env.JSONWEBTOKEN_SECRET || "defaultsecretnotsecure",
      audience: "cyclistsofmsn",
      issuer: "cyclistsofmsn",
      expiresIn: "14d",
    };
  }
}
