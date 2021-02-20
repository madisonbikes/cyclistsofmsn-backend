import { Database, PostHistory } from "./database";
import { expect } from "chai";
import { testContainer } from "./test/setup";
import { Importer } from "./legacy_import";

describe("test imports", () => {

  beforeEach(async () => {
    testContainer.clearInstances();

    const database = testContainer.resolve(Database);

    await database.connect();
    await PostHistory.deleteMany();
    await database.disconnect();
  });

  it("should import many previous posts", async function() {
    this.timeout(10000);
    const importer = testContainer.resolve(Importer);

    expect(
      await importer.perform_import(
        "./test_resources/test_post_history_325.log"
      )
    ).eq(325);

    const database = testContainer.resolve(Database);
    expect(await database.connect()).is.true;
    expect(await PostHistory.find()).length(325);
    await database.disconnect();
  });
});
