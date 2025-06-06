import {
  DocumentType,
  getModelForClass,
  isDocument,
  modelOptions,
  prop,
  ReturnModelType,
} from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { endOfDay, startOfDay } from "date-fns";
import { ImageClass } from "./images";

export enum PostStatus {
  PENDING = "pending",
  FAILED = "failed",
  COMPLETE = "complete",
}

export class PostHistoryStatus {
  @prop({
    enum: [PostStatus.PENDING, PostStatus.FAILED, PostStatus.COMPLETE],
    required: true,
    default: PostStatus.PENDING,
  })
  public flag!: string;

  @prop()
  public error?: string;

  @prop()
  public uri?: string;
}

@modelOptions({ schemaOptions: { collection: "posts" } })
export class PostHistoryClass {
  @prop({ ref: () => ImageClass })
  public image?: Ref<ImageClass>;

  @prop({ required: true, default: Date.now, index: true })
  public timestamp!: Date;

  @prop({ default: new PostHistoryStatus(), required: true, _id: false })
  public status!: PostHistoryStatus;

  public static findLatestPost(this: ReturnModelType<typeof PostHistoryClass>) {
    return this.findOne()
      .where({ "status.flag": PostStatus.COMPLETE })
      .sort({ timestamp: -1 })
      .populate({ path: "image", select: ["deleted"] });
  }

  /** returns sorted by timestamp ascending */
  public static async findOrderedPosts(
    this: ReturnModelType<typeof PostHistoryClass>,
  ) {
    const posts = await this.find()
      .sort({ timestamp: 1 })
      .populate({ path: "image", select: ["deleted"] });

    return posts.flatMap((post) => {
      const retval = post;
      if (isDocument(post.image) && post.image.deleted) {
        retval.image = undefined;
      }
      return retval;
    });
  }

  public static findScheduledPost(
    this: ReturnModelType<typeof PostHistoryClass>,
    when: Date,
  ) {
    const start = startOfDay(when);
    const end = endOfDay(when);

    return this.find()
      .where({
        "status.flag": PostStatus.PENDING,
        timestamp: { $gte: start, $lte: end },
      })
      .populate("image")
      .sort({ timestamp: -1 });
  }
}

export type PostHistoryDocument = DocumentType<PostHistoryClass>;
export const PostHistory = getModelForClass(PostHistoryClass);
