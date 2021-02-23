import { setupSuite, testContainer, testDatabase } from "./test";
import { PostHistory } from "./database";
import { Importer } from "./legacy_import";

describe("test imports", () => {
  setupSuite({ withDatabase: true });

  beforeEach(async () => {
    await PostHistory.deleteMany();
  });

  it("should import many previous posts", async function() {
    const importer = testContainer().resolve(Importer);
    const value = await importer.perform_import("./test_resources/test_post_history_325.log");
    expect(value).toEqual(325);

    // ensure database connection is back
    expect(await testDatabase().connect()).toEqual(true);
    expect(await PostHistory.find()).toHaveLength(325);
  });
});
