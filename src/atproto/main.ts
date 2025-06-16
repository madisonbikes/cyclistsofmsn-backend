import { readFile } from "fs/promises";
import { atPost } from ".";

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
