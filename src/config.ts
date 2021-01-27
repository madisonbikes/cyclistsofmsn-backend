import { config } from "dotenv";
import { resolve } from "path";

class ServerConfiguration {
  public server_port = process.env.PORT || "3001";
  public photos_dir = process.env.PHOTOS_DIR || "photos";
  public react_static_root_dir: string | undefined =
    process.env.STATIC_ROOT_DIR;
  public database_definition = process.env.DATABASE_DEFINITION || "default";
}

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
config({ path: file });

export const configuration = new ServerConfiguration();
