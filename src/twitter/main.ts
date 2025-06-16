import { readFile } from "fs/promises";
import { logger } from "../utils/logger.ts";
import { postTweet } from "./post.ts";

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  const fileBuffer = await readFile(args[1]);

  logger.debug("loaded file");
  return postTweet(args[0], fileBuffer);
};

if (process.argv.length !== 4) {
  console.log("Requires a status and an image filename for arguments.");
} else {
  const args = process.argv.slice(2);
  /** launches test tweet */
  Promise.resolve()
    .then(() => {
      return main(args);
    })
    .catch((error: unknown) => {
      console.error(error);
    });
}
