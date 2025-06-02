import { setupSuite } from "../test";
import { Image } from "../database";
import postExecutor from "./postExecutor";
import photoTooter from "../mastodon/post";
import photoTweeter from "../twitter/post";
import atproto from "../atproto";
import { vi, describe, it, expect } from "vitest";

vi.mock("../mastodon/post");
vi.mock("../twitter/post");
vi.mock("../atproto");

const mockPhotoTooter = vi.mocked(photoTooter);
mockPhotoTooter.isEnabled.mockReturnValue(true);

const mockPhotoTweeter = vi.mocked(photoTweeter);
mockPhotoTweeter.isEnabled.mockReturnValue(true);

const mockAtproto = vi.mocked(atproto);
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
