import { setupSuite, testContainer } from "../test";
import { Image } from "../database";
import { PostExecutor } from "./postExecutor";
import { injectable } from "tsyringe";
import { PhotoTwitterClient } from "../twitter/post";
import { PhotoMastodonClient } from "../mastodon/post";

describe("test executor component", () => {
  setupSuite({ withDatabase: true, clearPostHistory: true, clearImages: true });

  describe("with images", () => {
    it("should succeed if an image in the repository", async function () {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();

      const executor = buildExecutor();

      await executor.post(newImage);
    });
  });

  const buildExecutor = () => {
    const noopTweeter = testContainer().resolve(NoopPhotoTweeter);
    const noopTooter = testContainer().resolve(NoopPhotoTooter);

    return testContainer()
      .register(PhotoTwitterClient, { useValue: noopTweeter })
      .register(PhotoMastodonClient, { useValue: noopTooter })
      .resolve(PostExecutor);
  };
});

@injectable()
class NoopPhotoTweeter extends PhotoTwitterClient {
  override post(_image: string): Promise<number> {
    return Promise.resolve(0);
  }
}

@injectable()
class NoopPhotoTooter extends PhotoMastodonClient {
  override post(_image: string): Promise<string> {
    return Promise.resolve("0");
  }
}
