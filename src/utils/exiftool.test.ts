import fs from "fs/promises";
import path from "path";
import { updateImageDescription } from "./exiftool";
import { load } from "exifreader";
import tempfile from "tempfile";

describe("exiftool", () => {
  const testImageFile = path.resolve(
    __dirname,
    "../../test_resources/test_DSC07588_with_description.jpg",
  );

  let tempFile: string;
  beforeEach(async () => {
    tempFile = tempfile(".exiftool_test");
    await fs.copyFile(testImageFile, tempFile);
  });

  // clean up the temp file
  afterEach(async () => {
    await fs.unlink(tempFile);
  });

  it("updates the description", async () => {
    await updateImageDescription(tempFile, "new description");

    // check the description
    const tags = await load(tempFile, { expanded: true });
    expect(tags.exif?.ImageDescription?.description).toEqual("new description");
  });

  it("updates the description with funny characters", async () => {
    await updateImageDescription(tempFile, "new\n!!!description");
    const tags = await load(tempFile, { expanded: true });
    expect(tags.exif?.ImageDescription?.description).toEqual(
      "new\n!!!description",
    );
  });
});
