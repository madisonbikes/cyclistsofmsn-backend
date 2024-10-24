import { TwitterClient } from "twitter-api-client";
import { readFile } from "fs/promises";
import { configuration } from "../config";
import sharp from "sharp";
import fsRepository from "../fs_repository";
import { logger } from "../utils";

export default { isEnabled, post };

function isEnabled() {
  return (
    configuration.twitterApiKey !== "" &&
    configuration.twitterAccessToken !== "" &&
    configuration.twitterAccessTokenSecret !== ""
  );
}

async function post(filename: string): Promise<number> {
  const photoFilename = fsRepository.photoPath(filename);
  const buffer = await sharp(photoFilename)
    .resize({ width: 1600, withoutEnlargement: true })
    .toFormat("jpeg")
    .toBuffer();
  return postTweet("#cyclistsofmadison", buffer);
}

async function postTweet(status: string, buffer: Buffer): Promise<number> {
  const twitterClient = new TwitterClient({
    apiKey: configuration.twitterApiKey,
    apiSecret: configuration.twitterApiSecret,
    accessToken: configuration.twitterAccessToken,
    accessTokenSecret: configuration.twitterAccessTokenSecret,
  });
  const base64Buffer = buffer.toString("base64");

  const mediaResult = await twitterClient.media.mediaUpload({
    media: base64Buffer,
  });
  logger.info(mediaResult, `uploaded media`);

  const tweetResult = await twitterClient.tweets.statusesUpdate({
    status: status,
    media_ids: mediaResult.media_id_string,
  });
  return tweetResult.id;
}

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  const fileBuffer = await readFile(args[1]);

  logger.debug("loaded file");
  return postTweet(args[0], fileBuffer);
};

if (require.main === module) {
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
}
