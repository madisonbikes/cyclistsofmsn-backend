import { TwitterClient } from "twitter-api-client";
import { readFile } from "fs/promises";
import { configuration } from "../config.ts";
import sharp from "sharp";
import fsRepository from "../fs_repository/index.ts";
import { logger } from "../utils/index.ts";

export function isEnabled() {
  return (
    configuration.twitterApiKey !== "" &&
    configuration.twitterAccessToken !== "" &&
    configuration.twitterAccessTokenSecret !== ""
  );
}

export async function post(filename: string): Promise<number> {
  const photoFilename = fsRepository.photoPath(filename);
  const buffer = await sharp(photoFilename)
    .resize({ width: 1600, withoutEnlargement: true })
    .toFormat("jpeg")
    .toBuffer();
  return postTweet("#cyclistsofmadison", buffer);
}

export async function postTweet(
  status: string,
  buffer: Buffer,
): Promise<number> {
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
