import "reflect-metadata";
import { TwitterClient } from "twitter-api-client";
import { readFile } from "fs/promises";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "../config";

if (require.main === module) {
  if(process.argv.length != 4) {
    console.log("Requires a status and an image filename for arguments.")
  } else {
    const args = process.argv.slice(2)
    /** launches test tweet */
    Promise.resolve()
      .then(() => {
        const twitterClient = container.resolve(PhotoTwitterClient);
        return twitterClient.postTweet(args[0], args[1]);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

@injectable()
export class PhotoTwitterClient {
  constructor(private configuration: ServerConfiguration) {
  }

  async postTweet(status: string, photo: string): Promise<void> {
    const twitterClient = new TwitterClient({
      apiKey: this.configuration.twitterApiKey,
      apiSecret: this.configuration.twitterApiSecret,
      accessToken: this.configuration.twitterAccessToken,
      accessTokenSecret: this.configuration.twitterAccessTokenSecret
    });
    const file = await readFile(photo, { encoding: "base64" });
    console.log("loaded file");

    const mediaResult = await twitterClient.media.mediaUpload({ media: file.toString() });
    console.log(`uploaded media: ${JSON.stringify(mediaResult)}`);

    const tweetResult = await twitterClient.tweets.statusesUpdate({
      status: status,
      media_ids: mediaResult.media_id_string
    });
    console.log(`tweet posted with id ${tweetResult.id}`);
  }
}
