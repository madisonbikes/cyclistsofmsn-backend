import { setupTestContainer, testContainer } from "./test";
import { Database, PostHistory } from "./database";
import { Importer } from "./legacy_import";

describe("test imports", () => {
  setupTestContainer()

  beforeEach(async () => {
    const database = testContainer().resolve(Database);

    await database.connect();
    await PostHistory.deleteMany();
    await database.disconnect();
  });

  it("should import many previous posts", async function() {
    const importer = testContainer().resolve(Importer);

    expect(
      await importer.perform_import(
        "./test_resources/test_post_history_325.log"
      )
    ).toEqual(325);

    const database = testContainer().resolve(Database);
    expect(await database.connect()).toEqual(true);
    expect(await PostHistory.find()).toHaveLength(325);
    await database.disconnect();
  });
});
