import { configuration } from "../config.ts";
import sharp from "sharp";
import fsRepository from "../fs_repository/index.ts";
import request from "superagent";
import crypto from "crypto";
import { logger } from "../utils/index.ts";
import {
  mediaUploadResponseSchema,
  type StatusUpdateRequest,
  statusUpdateResponseSchema,
  type StatusUpdateVisibility,
  statusUpdateVisibilitySchema,
} from "./types.ts";

interface TootPostImageOptions {
  filename: string;
  buffer: Buffer;
  description?: string;
  focus?: string;
}

interface TootPostOptions {
  status: string;
  visibility?: StatusUpdateVisibility;
  image?: TootPostImageOptions;
}

export function isEnabled() {
  return (
    configuration.mastodonUri !== "" && configuration.mastodonAccessToken !== ""
  );
}

export async function post(
  filename: string,
  description?: string,
): Promise<string> {
  const photoFilename = fsRepository.photoPath(filename);
  const buffer = await sharp(photoFilename)
    .resize({ width: 1600, withoutEnlargement: true })
    .toFormat("jpeg")
    .toBuffer();

  const visibility = statusUpdateVisibilitySchema
    .optional()
    .parse(configuration.mastodonStatusVisibility);
  return postToot({
    status: "#cyclistsofmadison",
    visibility,
    image: { filename, buffer, description },
  });
}

export async function postToot(options: TootPostOptions): Promise<string> {
  let mediaId: string[] = [];
  if (options.image != null) {
    const mediaRequest = buildAuthorizedMastodonPostRequest(
      "/api/v2/media",
    ).attach("file", options.image.buffer, options.image.filename);

    if (options.image.focus != null) {
      mediaRequest.field("focus", options.image.focus);
    }
    if (options.image.description != null) {
      mediaRequest.field("description", options.image.description);
    }

    const mediaResponse = await mediaRequest;
    if (!mediaResponse.ok) {
      throw new Error(
        `Upload media error: ${JSON.stringify(mediaResponse.body)}`,
      );
    }

    logger.debug(
      { response: mediaResponse.body as unknown },
      `Uploaded media response`,
    );

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
  const tootResponse = await buildAuthorizedMastodonPostRequest(
    "/api/v1/statuses",
  )
    .set("Idempotency-Key", uuid)
    .send(requestBody);

  if (!tootResponse.ok) {
    throw new Error(`Post status error: ${JSON.stringify(tootResponse.body)}`);
  }

  logger.debug(
    { response: tootResponse.body as unknown },
    `Posted status response`,
  );
  return statusUpdateResponseSchema.parse(tootResponse.body).id;
}

function buildAuthorizedMastodonPostRequest(api: string) {
  return request
    .post(`${configuration.mastodonUri}/${api}`)
    .set("Authorization", `Bearer ${configuration.mastodonAccessToken}`);
}
