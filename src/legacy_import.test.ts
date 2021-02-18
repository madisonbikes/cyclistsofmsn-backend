import { perform_import } from "./legacy_import";
import { PostHistory } from "./database/post_history.model";
import { database } from "./database";

afterEach(async () => {
  await database.disconnect();
});

describe("test imports", () => {
  beforeEach(async () => {
      await database.connect();
      await PostHistory.deleteMany();
      await database.disconnect();
    }
  );

  it("should import many images", async () => {
    await expect(
      perform_import("./test_resources/test_post_history_325.log"))
      .resolves
      .toBe(325);

    await expect(database.connect()).resolves.toBeUndefined();
    await expect(PostHistory.find()).resolves.toHaveLength(325);
  });
});