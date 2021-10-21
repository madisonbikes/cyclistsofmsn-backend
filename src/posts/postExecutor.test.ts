import { assertError, MutableNow, NotVeryRandom, setupSuite, testContainer } from "../test";
import { Image, PostHistory } from "../database";
import { PostExecutor } from "./postExecutor";
import { NowProvider, RandomProvider } from "../utils";
import { PostScheduler } from "./scheduler";

describe("test executor component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(async () => {
    // clear posts and images
    await PostHistory.deleteMany();
    await Image.deleteMany();
  });

  describe("with no images", () => {
    it("should fail if no images in repository", async function() {
      const executor = buildExecutor()

      const error = await executor.execute(new PostHistory())
      assertError(error);
      expect(error.value).toEqual("no images");
    });
  });

  function buildExecutor() {
    return testContainer().resolve(PostExecutor)
  }
})