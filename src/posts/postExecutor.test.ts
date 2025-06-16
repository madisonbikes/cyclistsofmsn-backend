import { setupSuite } from "../test";
import postExecutor from "./postExecutor";
import * as photoTooter from "../mastodon/post";
import * as photoTweeter from "../twitter/post";
import * as atproto from "../atproto";
import { vi, describe, it, expect } from "vitest";
import { imageModel } from "../database/database";

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
      const insertedImage = await imageModel.insertOne({
        filename: "blarg",
      });

      const newImage = await imageModel.findById(insertedImage._id);
      expect(newImage).toBeDefined();
      if (newImage === null) {
        throw new Error("Image not found");
      }

      await postExecutor.post(newImage);

      expect(mockPhotoTooter.post).toHaveBeenCalledTimes(1);
      expect(mockPhotoTweeter.post).toHaveBeenCalledTimes(1);
      expect(atproto.post).toHaveBeenCalledTimes(1);
    });
  });
});
