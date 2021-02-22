import { setupTestContainer, testContainer } from "./test";
import { Database, PostHistory } from "./database";
import { Importer } from "./legacy_import";

describe("test imports", () => {
  setupTestContainer();

  beforeEach(async () => {
    await PostHistory.deleteMany();
  });

  it("should import many previous posts", async function() {

    const importer = testContainer().resolve(Importer);
    const value = await importer.perform_import("./test_resources/test_post_history_325.log");
    expect(value).toEqual(325);

    // ensure database connection is back
    const database = testContainer().resolve(Database);
    expect(await database.connect()).toEqual(true);
    expect(await PostHistory.find()).toHaveLength(325);
  });
});
