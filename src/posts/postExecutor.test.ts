import { assertError, assertOk, setupSuite, testContainer } from "../test";
import { Image, PostHistory } from "../database";
import { PostExecutor } from "./postExecutor";
import { ImageRepositoryScanner } from "../scan";
import { injectable } from "tsyringe";
import { PhotoTwitterClient } from "../twitter/post";
import { PhotoMastadonClient } from "../mastadon/post";
import { ok, Result } from "../utils";

describe("test executor component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(async () => {
    // clear posts and images
    await PostHistory.deleteMany();
    await Image.deleteMany();
  });

  describe("with no images", () => {
    it("should fail if no images in repository", async function () {
      const executor = buildExecutor();

      const postedImage = await executor.post();
      assertError(postedImage);
      expect(postedImage.value.message).toEqual("no images");
    });
  });

  describe("with images", () => {
    it("should succeed if an image in the repository", async function () {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();

      const executor = buildExecutor();

      const postedImage = await executor.post();
      assertOk(postedImage);
      expect(postedImage.value.filename).toEqual("blarg");
    });
  });

  const buildExecutor = () => {
    const noopScanner = testContainer().resolve(NoopRepositoryScanner);
    const noopTweeter = testContainer().resolve(NoopPhotoTweeter);
    const noopTooter = testContainer().resolve(NoopPhotoTooter);

    return testContainer()
      .register<ImageRepositoryScanner>(ImageRepositoryScanner, {
        useValue: noopScanner,
      })
      .register(PhotoTwitterClient, { useValue: noopTweeter })
      .register(PhotoMastadonClient, { useValue: noopTooter })
      .resolve(PostExecutor);
  };
});

@injectable()
class NoopRepositoryScanner extends ImageRepositoryScanner {
  start(): Promise<void> {
    return Promise.resolve();
  }
}

@injectable()
class NoopPhotoTweeter extends PhotoTwitterClient {
  post(_image: string): Promise<number> {
    return Promise.resolve(0);
  }
}

@injectable()
class NoopPhotoTooter extends PhotoMastadonClient {
  post(_image: string): Promise<Result<string, string>> {
    return Promise.resolve(ok(""));
  }
}
