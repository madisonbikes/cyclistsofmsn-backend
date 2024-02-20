import { execFile } from "promisify-child-process";
import fs from "fs/promises";
import tempfile from "tempfile";

export const updateImageDescription = async (
  file: string,
  description: string,
) => {
  // save description to a temp file
  const argFile = tempfile(".argFile");
  await fs.writeFile(argFile, description);
  const newFile = tempfile(".newFile");
  await execFile("exiftool", [
    `-mwg:Description<=${argFile}`,
    file,
    "-o",
    newFile,
  ]);
  await fs.unlink(argFile);
  await fs.copyFile(newFile, file);
  await fs.unlink(newFile);
};
