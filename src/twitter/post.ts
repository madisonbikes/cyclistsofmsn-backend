import "reflect-metadata";
import { TwitterClient } from "twitter-api-client";
import { readFile } from "fs/promises";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "../config";
import sharp from "sharp";
import { FilesystemRepository } from "../fs_repository";

@injectable()
export class PhotoTwitterClient {
  constructor(
    private configuration: ServerConfiguration,
    private repository: FilesystemRepository
  ) {}

  isEnabled() {
    return (
      this.configuration.twitterApiKey !== "" &&
      this.configuration.twitterAccessToken !== "" &&
      this.configuration.twitterAccessTokenSecret !== ""
    );
  }

  async post(filename: string): Promise<number> {
    const photoFilename = this.repository.photoPath(filename);
    const buffer = await sharp(photoFilename)
      .resize({ width: 1600, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();
    return this.postTweet("#cyclistsofmadison", buffer);
  }

  async postTweet(status: string, buffer: Buffer): Promise<number> {
    const twitterClient = new TwitterClient({
      apiKey: this.configuration.twitterApiKey,
      apiSecret: this.configuration.twitterApiSecret,
      accessToken: this.configuration.twitterAccessToken,
      accessTokenSecret: this.configuration.twitterAccessTokenSecret,
    });
    const base64Buffer = buffer.toString("base64");

    const mediaResult = await twitterClient.media.mediaUpload({
      media: base64Buffer,
    });
    console.log(`uploaded media: ${JSON.stringify(mediaResult)}`);

    const tweetResult = await twitterClient.tweets.statusesUpdate({
      status: status,
      media_ids: mediaResult.media_id_string,
    });
    return tweetResult.id;
  }
}

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  const twitterClient = container.resolve(PhotoTwitterClient);
  const fileBuffer = await readFile(args[1]);

  console.log("loaded file");
  return twitterClient.postTweet(args[0], fileBuffer);
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
      .catch((error) => {
        console.error(error);
      });
  }
}
