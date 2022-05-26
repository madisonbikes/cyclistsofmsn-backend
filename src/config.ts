import dotenv from "dotenv";
import { injectable, singleton } from "tsyringe";

const isDev = process.env.NODE_ENV === "development";

const DEFAULT_SERVER_PORT = 3001;

@injectable()
@singleton()
export class ServerConfiguration {
  public serverPort = process.env.PORT || `${DEFAULT_SERVER_PORT}`;
  public photosDir = process.env.PHOTOS_DIR || "photos";
  public reactStaticRootDir?: string = process.env.STATIC_ROOT_DIR;
  public mongodbUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/cyclists_of_msn";
  public firstPostHour = 8;
  public lastPostHour = 16;
  public twitterApiKey = process.env.TWITTER_API_KEY || "";
  public twitterApiSecret = process.env.TWITTER_API_SECRET || "";
  public twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN || "";
  public twitterAccessTokenSecret =
    process.env.TWITTER_ACCESS_TOKEN_SECRET || "";
}

// this has to run first outside of constructor
const result = dotenv.config();
if (result.error && isDev) {
  console.log(result.error);
}
