import { execFile } from "promisify-child-process";
import fs from "fs/promises";
import tempfile from "tempfile";

export const updateImageDescription = async (
  file: string,
  description: string,
) => {
  const newFile = tempfile(".newFile");
  await execFile("exiftool", [
    `-mwg:Description=${description}`,
    file,
    "-o",
    newFile,
  ]);
  await fs.copyFile(newFile, file);
  await fs.unlink(newFile);
};
