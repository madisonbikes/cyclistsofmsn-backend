import fs from "fs/promises";
import path from "path";
import { updateImageDescription } from "./exiftool";
import { load } from "exifreader";

describe("exiftool", () => {
  const imageFile = path.resolve(
    __dirname,
    "../../test_resources/test_DSC07588_with_description.jpg",
  );
  let tempFile: string;

  beforeEach(async () => {
    const { temporaryFile } = await import("tempy");
    tempFile = temporaryFile({ name: "exiftool_test" });
    await fs.copyFile(imageFile, tempFile);
  });

  it("behaves", async () => {
    await updateImageDescription(tempFile, "new description");
    const tags = await load(tempFile, { expanded: true });
    expect(tags.exif?.ImageDescription).toEqual("new description");
  });

  afterEach(async () => {
    await fs.unlink(tempFile);
  });
});
