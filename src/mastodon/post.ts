import { readFile } from "fs/promises";
import { configuration } from "../config";
import sharp from "sharp";
import { fsRepository } from "../fs_repository";
import request from "superagent";
import crypto from "crypto";
import { logger } from "../utils";
import {
  mediaUploadResponseSchema,
  StatusUpdateRequest,
  statusUpdateResponseSchema,
  MediaUploadRequest,
  StatusUpdateVisibility,
  statusUpdateVisibilitySchema,
} from "./types";

type TootPostImageOptions = {
  filename: string;
  buffer: Buffer;
  description?: string;
  focus?: string;
};

type TootPostOptions = {
  status: string;
  visibility?: StatusUpdateVisibility;
  image?: TootPostImageOptions;
};

class PhotoMastodonClient {
  isEnabled() {
    return (
      configuration.mastodonUri !== "" &&
      configuration.mastodonAccessToken !== ""
    );
  }

  async post(filename: string, description?: string): Promise<string> {
    const photoFilename = fsRepository.photoPath(filename);
    const buffer = await sharp(photoFilename)
      .resize({ width: 1600, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();

    const visibility = statusUpdateVisibilitySchema
      .optional()
      .parse(configuration.mastodonStatusVisibility);
    return this.postToot({
      status: "#cyclistsofmadison",
      visibility,
      image: { filename, buffer, description },
    });
  }

  async postToot(options: TootPostOptions): Promise<string> {
    let mediaId: string[] = [];
    if (options.image !== undefined) {
      const mediaFields: MediaUploadRequest = {
        focus: options.image.focus,
        description: options.image.description,
      };
      const mediaRequest = this.buildAuthorizedMastodonPostRequest(
        "/api/v2/media",
      ).attach("file", options.image.buffer, options.image.filename);

      for (const [key, value] of Object.entries(mediaFields)) {
        if (value !== undefined) {
          void mediaRequest.field(key, value);
        }
      }

      const mediaResponse = await mediaRequest;
      if (!mediaResponse.ok) {
        throw new Error(
          `Upload media error: ${JSON.stringify(mediaResponse.body)}`,
        );
      }

      logger.debug({ response: mediaResponse.body }, `Uploaded media response`);

      const { id } = mediaUploadResponseSchema.parse(mediaResponse.body);
      mediaId = [id];
    }

    const requestBody: StatusUpdateRequest = {
      status: options.status,
      visibility: options.visibility,
      media_ids: mediaId,
    };

    // FIXME when we introduce message queue/etc use same UUID for retries
    const uuid = crypto.randomUUID();
    const tootResponse = await this.buildAuthorizedMastodonPostRequest(
      "/api/v1/statuses",
    )
      .set("Idempotency-Key", uuid)
      .send(requestBody);

    if (!tootResponse.ok) {
      throw new Error(
        `Post status error: ${JSON.stringify(tootResponse.body)}`,
      );
    }

    logger.debug({ response: tootResponse.body }, `Posted status response`);
    return statusUpdateResponseSchema.parse(tootResponse.body).id;
  }

  private buildAuthorizedMastodonPostRequest(api: string) {
    return request
      .post(`${configuration.mastodonUri}/${api}`)
      .set("Authorization", `Bearer ${configuration.mastodonAccessToken}`);
  }
}

export const photoTooter = new PhotoMastodonClient();

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  const fileBuffer = await readFile(args[1]);

  console.log("loaded file");
  return photoTooter.postToot({
    status: args[0],
    visibility: "direct",
    image: {
      filename: args[1],
      buffer: fileBuffer,
      description: "useful alt tag description",
      focus: "(0.25,0.25)",
    },
  });
};

if (require.main === module) {
  if (process.argv.length !== 4) {
    console.log("Requires a status and an image filename for arguments.");
  } else {
    const args = process.argv.slice(2);
    /** launches test post */
    Promise.resolve()
      .then(() => {
        return main(args);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
