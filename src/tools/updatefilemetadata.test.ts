import { setupSuite } from "../test/index.ts";
import { getGoodImageId } from "../test/data.ts";
import { updateFileMetadata } from "./updatefilemetadata.ts";
import { describe, it, expect } from "vitest";
import { imageModel } from "../database/database.ts";

describe("updateFileMetadata", () => {
  setupSuite({
    withDatabase: true,
    withPhotoServer: true,
    withMutableTestResources: true,
  });

  it("updates the metadata", async () => {
    const goodImageId = await getGoodImageId();
    const image = await imageModel.findById(goodImageId);
    expect(image).toBeDefined();
    if (!image) throw new Error("image is undefined");
    expect(image.description).toBe("blarg");
    expect(image.description_from_exif).toBe(true);

    // force the image to need to be updated because description_from_exif is false and there's a description
    await imageModel.updateOne(goodImageId, { description_from_exif: false });

    const count = await updateFileMetadata();
    expect(count).toBe(1);

    const image2 = await imageModel.findById(goodImageId);
    expect(image2?.description_from_exif).toBe(true);
  });
});
