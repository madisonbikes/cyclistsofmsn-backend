import { Schema } from "mongoose";
import { PostHistoryDocument, PostHistoryModel, PostStatus } from "./post_history.types";
import { PostHistory } from "./post_history.model";
import assert from "assert";
import { Image } from "./images.model";

export const PostHistorySchema = new Schema<PostHistoryDocument, PostHistoryModel>({
  image: { type: Schema.Types.ObjectId, ref: "images", required: true },
  timestamp: { type: Schema.Types.Date, required: true, default: Date.now, index: true },
  status: {
    flag: {
      type: String,
      enum: [PostStatus.PENDING, PostStatus.FAILED, PostStatus.COMPLETE],
      required: true
    },
    error: {
      type: String
    },
    uri: {
      type: String
    }
  }
});

PostHistorySchema.statics.findCurrentPost = async (): Promise<PostHistoryDocument | null> => {
  return PostHistory.findOne()
    .where({ "status.flag": PostStatus.COMPLETE })
    .sort({ timestamp: "-1" })
    .populate("image", "deleted");
};

PostHistorySchema.statics.findOrderedPosts = async () => {
  const posts = await PostHistory.find()
    .sort({ timestamp: "1" })
    .populate("image", "deleted");

  return posts
    .filter((post) => {
      assert(post.image instanceof Image);
      return !post.image.deleted;
    });
};

PostHistorySchema.statics.findNextScheduledPost = async (): Promise<PostHistoryDocument | null> => {
  return PostHistory.findOne()
    .where({ "status.flag": PostStatus.PENDING })
    .sort({ timestamp: "-1" });
};
