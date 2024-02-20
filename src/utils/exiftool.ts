import { execFile } from "promisify-child-process";
import fs from "fs/promises";

export const updateImageDescription = async (
  file: string,
  description: string,
) => {
  const { temporaryWrite, temporaryFile } = await import("tempy");
  const argFile = await temporaryWrite(description, { name: "args" });
  const newFile = temporaryFile({ name: "newFile" });
  await execFile("exiftool", [
    `-mwg:Description<${argFile}`,
    file,
    "-o",
    newFile,
  ]);
  await fs.unlink(argFile);
  await fs.copyFile(newFile, file);
  await fs.unlink(newFile);
};
