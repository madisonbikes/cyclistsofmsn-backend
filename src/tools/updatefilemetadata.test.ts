import { setupSuite } from "../test";
import { Image } from "../database";
import { getGoodImageId } from "../test/data";
import { updateFileMetadata } from "./updatefilemetadata";

describe("updateFileMetadata", () => {
  setupSuite({
    withDatabase: true,
    withPhotoServer: true,
    withMutableTestResources: true,
  });

  it("updates the metadata", async () => {
    const goodImageId = await getGoodImageId();
    const image = await Image.findById(goodImageId);
    expect(image).toBeDefined();
    if (!image) throw new Error("image is undefined");
    expect(image.description).toBe("blarg");
    expect(image.description_from_exif).toBe(true);

    image.description_from_exif = false;
    await image.save();

    const count = await updateFileMetadata();
    expect(count).toBe(1);

    const image2 = await Image.findById(goodImageId);
    expect(image2?.description_from_exif).toBe(true);
  });
});
