import { PostHistory } from "./database/post_history.model";
import { expect } from "chai";
import { container } from "./test/setup";
import { Database } from "./database";
import { Importer } from "./legacy_import";

describe("test imports", function () {
  const database = container.resolve(Database);

  beforeEach(async function () {
    container.clearInstances()

    await database.connect();
    await PostHistory.deleteMany();
    await database.disconnect();
  });

  it("should import many previous posts", async function () {
    this.timeout(10000);
    const importer = container.resolve(Importer);

    expect(
      await importer.perform_import(
        "./test_resources/test_post_history_325.log"
      )
    ).eq(325);

    expect(await database.connect()).is.true;
    expect(await PostHistory.find()).length(325);
    await database.disconnect();
  });
});
