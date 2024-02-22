import { execFile } from "promisify-child-process";
import fs from "fs-extra";
import tempfile from "tempfile";
import { logger } from ".";

export const updateImageDescription = async (
  file: string,
  description: string,
) => {
  if (fs.existsSync(file) === false) {
    logger.error(`File not found: ${file}`);
    return { error: "File not found" };
  }

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
  return {};
};
