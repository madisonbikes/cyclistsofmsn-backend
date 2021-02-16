import { perform_import } from "./legacy_import";
import { PostHistory } from "./database/post_history.model";
import { database } from "./database";

afterEach(async () => {
  await database.disconnect()
})

test("perform test import", async () => {
  await perform_import("./test_resources/test_post_history_325.log");

  await database.connect()
  const posts = await PostHistory.find();
  expect(posts.length).toBe(325);
});