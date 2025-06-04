import { Schema, model, InferSchemaType } from "mongoose";
import { ObjectId } from "mongodb";
import { endOfDay, startOfDay } from "date-fns";
import { ImageDocument } from "./images";

const postStatusNames = ["pending", "failed", "complete"] as const;
//type PostStatus = (typeof postStatusNames)[number];

const postHistoryStatusSchema = new Schema({
  flag: {
    type: String,
    enum: postStatusNames,
    required: true,
    default: "pending",
  },
  error: { type: String },
  uri: { type: String },
});

type PostHistoryStatusDocument = InferSchemaType<
  typeof postHistoryStatusSchema
>;

const postHistorySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true, required: true },
    image: { type: Schema.Types.ObjectId, ref: "images" },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    status: {
      type: postHistoryStatusSchema,
      required: true,
      default: { flag: "pending" },
      _id: false,
    },
  },
  {
    statics: {
      findLatestPost() {
        return this.findOne()
          .where({ "status.flag": "complete" })
          .sort({ timestamp: -1 })
          .populate<{ image: ImageDocument | null }>({
            path: "image",
            select: ["deleted"],
          });
      },

      async findOrderedPosts() {
        const posts = await this.find()
          .sort({ timestamp: 1 })
          .populate<{ image: ImageDocument | null }>({
            path: "image",
            select: ["deleted"],
          });

        return posts.flatMap((post) => {
          if (post.image?.deleted === true) {
            post.image = null;
          }
          return post;
        });
      },

      findScheduledPost(when: Date) {
        const start = startOfDay(when);
        const end = endOfDay(when);

        return this.find()
          .where({
            "status.flag": { $eq: "pending" },
            timestamp: { $gte: start, $lte: end },
          })
          .populate<{ image: ImageDocument | null }>("image")
          .sort({ timestamp: -1 });
      },

      updatePostStatus(postId: ObjectId, status: PostHistoryStatusDocument) {
        return this.updateOne({ _id: postId }, { $set: status });
      },
    },
  },
);

export type PostHistoryDocument = InferSchemaType<typeof postHistorySchema>;

export const PostHistory = model("posts", postHistorySchema);
