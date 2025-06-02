import fs from "fs-extra";
import path from "path";
import { updateImageDescription } from "./exiftool.js";
import { load } from "exifreader";
import tempfile from "tempfile";
import { testResourcesDir } from "./test/index.js";

describe("exiftool", () => {
  const testImageFile = path.resolve(
    testResourcesDir(),
    "test_DSC07588_with_description.jpg",
  );

  let tempFile: string;
  beforeEach(async () => {
    tempFile = tempfile(".exiftool_test");
    await fs.copy(testImageFile, tempFile, {
      errorOnExist: true,
    });
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
