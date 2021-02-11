import { Schema } from "mongoose";
import { PostHistoryModel, PostHistoryDocument } from "./post_history.types";
import { PostHistory } from "./post_history.model";
import assert from "assert";
import { Image } from "./images.model";

export const PostHistorySchema = new Schema<PostHistoryDocument, PostHistoryModel>({
  image: { type: Schema.Types.ObjectId, ref: "images", required: true },
  timestamp: { type: Schema.Types.Date, required: true, default: Date.now },
  destination: { type: Schema.Types.Mixed }
});

PostHistorySchema.statics.findCurrentPost = async (): Promise<PostHistoryDocument | null> => {
  return PostHistory.findOne()
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
