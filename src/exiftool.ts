import { execFile } from "promisify-child-process";
import fs from "fs-extra";
import tempfile from "tempfile";
import { logger } from "./utils/index.ts";

export const updateImageDescription = async (
  file: string,
  description: string,
) => {
  if (!fs.existsSync(file)) {
    logger.error("File not found: %s", file);
    return { error: "File not found" };
  }

  // save description to a temp file
  const argFile = tempfile(".argFile");
  await fs.writeFile(argFile, description);
  const newFile = tempfile(".newFile");
  await fs.copy(file, newFile, {
    errorOnExist: true,
    preserveTimestamps: true,
  });
  logger.info("Updating %s with description: %s", newFile, description);
  const { stdout, stderr } = await execFile(
    "exiftool",
    ["-overwrite_original", `-mwg:Description<=${argFile}`, newFile],
    { maxBuffer: 1024 * 1024 * 1024 },
  );
  if (stdout != null) logger.info("execFile stdout:", stdout);
  if (stderr != null) logger.info("execFile stderr:", stderr);
  await fs.unlink(argFile);
  await fs.copy(newFile, file, { overwrite: true, preserveTimestamps: true });
  await fs.unlink(newFile);
  return {};
};
