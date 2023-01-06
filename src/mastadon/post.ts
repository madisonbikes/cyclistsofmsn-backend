import "reflect-metadata";
import { readFile } from "fs/promises";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "../config";
import sharp from "sharp";
import { FilesystemRepository } from "../fs_repository";
import request from "superagent";
import crypto from "crypto";
import { z } from "zod";
import { logger } from "../utils";

const mediaUploadResponseSchema = z.object({ id: z.string() });
const statusUpdateRequestSchema = z.object({
  status: z.string(),
  media_ids: z.string().array(),
});
type StatusUpdateRequestSchema = z.infer<typeof statusUpdateRequestSchema>;
const statusUpdateResponseSchema = z.object({ id: z.string() });

@injectable()
export class PhotoMastadonClient {
  constructor(
    private configuration: ServerConfiguration,
    private repository: FilesystemRepository
  ) {}

  isEnabled() {
    return (
      this.configuration.mastadonUri !== "" &&
      this.configuration.mastadonAccessToken !== ""
    );
  }

  async post(filename: string): Promise<string> {
    const photoFilename = this.repository.photoPath(filename);
    const buffer = await sharp(photoFilename)
      .resize({ width: 1600, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();
    return this.postToot("#cyclistsofmadison", filename, buffer);
  }

  async postToot(
    status: string,
    filename: string,
    buffer: Buffer
  ): Promise<string> {
    const mediaResponse = await this.buildAuthorizedMastadonPostRequest(
      "/api/v2/media"
    )
      .attach("file", buffer, filename)
      .field("focus", "(0.0,0.0)");

    if (!mediaResponse.ok) {
      throw new Error(
        `Upload media error: ${JSON.stringify(mediaResponse.body)}`
      );
    }

    logger.debug(
      `Uploaded media response: ${JSON.stringify(mediaResponse.body)}`
    );

    const mediaId = mediaUploadResponseSchema.parse(mediaResponse.body).id;

    const requestBody: StatusUpdateRequestSchema = {
      status: status,
      media_ids: [mediaId],
    };

    // FIXME when we introduce message queue/etc use same UUID for retries
    const uuid = crypto.randomUUID();
    const tootResponse = await this.buildAuthorizedMastadonPostRequest(
      "/api/v1/statuses"
    )
      .set("Idempotency-Key", uuid)
      .send(requestBody);

    if (!tootResponse.ok) {
      throw new Error(
        `Post status error: ${JSON.stringify(tootResponse.body)}`
      );
    }

    logger.debug(
      `Posted status response: ${JSON.stringify(tootResponse.body)}`
    );
    return statusUpdateResponseSchema.parse(tootResponse.body).id;
  }

  buildAuthorizedMastadonPostRequest(api: string) {
    return request
      .post(`${this.configuration.mastadonUri}/${api}`)
      .set("Authorization", `Bearer ${this.configuration.mastadonAccessToken}`);
  }
}

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  const twitterClient = container.resolve(PhotoMastadonClient);
  const fileBuffer = await readFile(args[1]);

  console.log("loaded file");
  return twitterClient.postToot(args[0], args[1], fileBuffer);
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
