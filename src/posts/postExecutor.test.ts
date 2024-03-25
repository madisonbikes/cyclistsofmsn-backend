import { setupSuite } from "../test";
import { Image } from "../database";
import postExecutor from "./postExecutor";
import photoTooter from "../mastodon/post";
import photoTweeter from "../twitter/post";

jest.mock("../mastodon/post");
jest.mock("../twitter/post");

const mockPhotoTooter = jest.mocked(photoTooter);
mockPhotoTooter.isEnabled.mockReturnValue(true);

const mockPhotoTweeter = jest.mocked(photoTweeter);
mockPhotoTweeter.isEnabled.mockReturnValue(true);

describe("test executor component", () => {
  setupSuite({ withDatabase: true, clearPostHistory: true, clearImages: true });

  describe("with images", () => {
    it("should succeed if an image in the repository", async function () {
      const newImage = new Image();
      newImage.filename = "blarg";
      newImage.fs_timestamp = new Date();
      await newImage.save();

      await postExecutor.post(newImage);

      expect(mockPhotoTooter.post).toHaveBeenCalledTimes(1);
      expect(mockPhotoTweeter.post).toHaveBeenCalledTimes(1);
    });
  });
});
