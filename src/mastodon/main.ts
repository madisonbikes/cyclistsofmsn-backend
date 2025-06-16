import { readFile } from "fs/promises";
import { postToot } from "./post.ts";

/** simple command-line capability for testing */
const main = async (args: string[]) => {
  const fileBuffer = await readFile(args[1]);

  console.log("loaded file");
  return postToot({
    status: args[0],
    visibility: "direct",
    image: {
      filename: args[1],
      buffer: fileBuffer,
      description: "useful alt tag description",
      focus: undefined,
    },
  });
};

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
