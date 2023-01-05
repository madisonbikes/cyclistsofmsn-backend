import dotenv from "dotenv";
import { injectable, singleton } from "tsyringe";

const isDev = process.env.NODE_ENV === "development";

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

  public readonly jwt: JwtConfiguration;

  constructor() {
    this.jwt = {
      secret: process.env.JSONWEBTOKEN_SECRET || "defaultsecretnotsecure",
      audience: "cyclistsofmsn",
      issuer: "cyclistsofmsn",
      expiresIn: "14d",
    };
  }
}

// this has to run first outside of constructor
const result = dotenv.config();
if (result.error && isDev) {
  console.log(result.error);
}
