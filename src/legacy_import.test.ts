import {perform_import } from "./legacy_import"

test("perform test import", async () => {
  await perform_import("./test_resources/post_history.log")
})