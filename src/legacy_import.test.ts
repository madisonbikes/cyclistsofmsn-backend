import { perform_import } from "./legacy_import";
import { PostHistory } from "./database/post_history.model";
import { database } from "./database";
import { expect } from "chai";

describe("test imports", function() {
  beforeEach(async function() {
      await database.connect();
      await PostHistory.deleteMany();
      await database.disconnect();
    }
  );

  afterEach(async () => {
    await database.disconnect();
  });


  it("should import many previous posts", async function() {
    this.timeout(10000);
    expect(
      await perform_import("./test_resources/test_post_history_325.log")
    ).eq(325);

    expect(await database.connect()).is.true;
    expect(await PostHistory.find()).length(325);
  });
});