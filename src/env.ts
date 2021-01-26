import { config } from "dotenv";
import { resolve } from "path";

class ServerConfiguration {
  public server_port: string;
  public photos_dir: string;
  public react_static_root_dir: string | undefined;

  constructor() {
    this.server_port = process.env.PORT || "3001";
    this.photos_dir = process.env.PHOTOS_DIR || "photos";
    this.react_static_root_dir = process.env.STATIC_ROOT_DIR;
  }
}

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
config({ path: file });

const configuration = new ServerConfiguration();
export default configuration;
