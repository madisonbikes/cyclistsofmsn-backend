import { setupSuite } from "../test";
import { Image } from "../database";
import postExecutor from "./postExecutor";
import photoTooter from "../mastodon/post";
import photoTweeter from "../twitter/post";
import atproto from "../atproto";

jest.mock("../mastodon/post");
jest.mock("../twitter/post");
jest.mock("../atproto");

const mockPhotoTooter = jest.mocked(photoTooter);
mockPhotoTooter.isEnabled.mockReturnValue(true);

const mockPhotoTweeter = jest.mocked(photoTweeter);
mockPhotoTweeter.isEnabled.mockReturnValue(true);

const mockAtproto = jest.mocked(atproto);
mockAtproto.isEnabled.mockReturnValue(true);

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
      expect(atproto.post).toHaveBeenCalledTimes(1);
    });
  });
});
