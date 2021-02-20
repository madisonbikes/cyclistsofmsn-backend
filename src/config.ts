import { config } from "dotenv";
import { resolve } from "path";
import { injectable, singleton } from "tsyringe";

export const DEFAULT_SERVER_PORT = 3001;

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
}

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
config({ path: file });
