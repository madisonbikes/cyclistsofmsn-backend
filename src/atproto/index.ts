import { configuration } from "../config";
import sharp from "sharp";
import fsRepository from "../fs_repository";
import { AtpAgent } from "@atproto/api";

export function isEnabled() {
  return (
    configuration.atProtoUsername !== "" && configuration.atProtoPassword !== ""
  );
}

export async function post(filename: string, description: string) {
  const photoFilename = fsRepository.photoPath(filename);
  const buffer = await sharp(photoFilename)
    .resize({ width: 1600, withoutEnlargement: true })
    .toFormat("jpeg")
    .toBuffer();
  return atPost({
    status: "#cyclistsofmadison",
    image: buffer,
    imageAltText: description,
  });
}

interface PostOptions {
  status: string;
  image: Buffer;
  imageAltText: string;
}

export const atPost = async ({ status, image, imageAltText }: PostOptions) => {
  const agent = new AtpAgent({
    service: "https://bsky.social",
  });
  await agent.login({
    identifier: configuration.atProtoUsername,
    password: configuration.atProtoPassword,
  });
  const { data } = await agent.uploadBlob(image);

  return await agent.post({
    text: status,
    embed: {
      $type: "app.bsky.embed.images",
      images: [
        // can be an array up to 4 values
        {
          alt: imageAltText,
          image: data.blob,
        },
      ],
    },
  });
};
