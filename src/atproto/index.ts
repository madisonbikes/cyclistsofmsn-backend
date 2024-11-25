import { readFile } from "fs/promises";
import { configuration } from "../config";
import sharp from "sharp";
import fsRepository from "../fs_repository";
import { AtpAgent } from "@atproto/api";

function isEnabled() {
  return (
    configuration.atProtoUsername !== "" && configuration.atProtoPassword !== ""
  );
}

async function post(filename: string, description?: string) {
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
  imageAltText?: string;
}

const atPost = async ({ status, image, imageAltText }: PostOptions) => {
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

export default { isEnabled, post };

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  console.log("loaded file");
  const fileBuffer = await readFile(args[1]);
  return atPost({
    status: args[0],
    image: fileBuffer,
    imageAltText: "useful alt tag description",
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
      .catch((error: unknown) => {
        console.error(error);
      });
  }
}
