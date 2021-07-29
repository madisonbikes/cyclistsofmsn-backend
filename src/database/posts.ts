import { DocumentType, getModelForClass, modelOptions, prop, ReturnModelType } from "@typegoose/typegoose";
import { Image, ImageClass } from "./images";
import assert from "assert";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

export enum PostStatus { PENDING = "pending", FAILED = "failed", COMPLETE = "complete" }

export class PostHistoryStatus {
  @prop({
    enum: [PostStatus.PENDING, PostStatus.FAILED, PostStatus.COMPLETE],
    required: true,
    default: PostStatus.PENDING
  })
  public flag!: string;

  @prop()
  public error?: string;

  @prop()
  public uri?: string;
}

@modelOptions({ schemaOptions: { collection: "posts" } })
class PostHistoryClass implements Base {
  id!: string;
  _id!: Types.ObjectId;

  @prop({ ref: () => ImageClass, required: true })
  public image!: ImageClass;

  @prop({ required: true, default: Date.now, index: true })
  public timestamp!: Date;

  @prop({ default: new PostHistoryStatus(), required: true })
  public status!: PostHistoryStatus;

  public static async findCurrentPost(this: ReturnModelType<typeof PostHistoryClass>){
    const val = this.findOne()
      .where({ "status.flag": PostStatus.COMPLETE })
      .sort({ timestamp: "-1" })
      .populate("image", "deleted");
    return val;
  };

  public static async findOrderedPosts(this: ReturnModelType<typeof PostHistoryClass>) {
    const posts = await this.find()
      .sort({ timestamp: "1" })
      .populate("image", "deleted");

    return posts
      .filter((post) => {
        assert(post.image instanceof Image);
        return !post.image.deleted;
      });
  };

  public static async findNextScheduledPost(this: ReturnModelType<typeof PostHistoryClass>){
    return this.findOne()
      .where({ "status.flag": PostStatus.PENDING })
      .sort({ timestamp: "-1" });
  };
}
export type PostHistoryDocument = DocumentType<PostHistoryClass>;
export const PostHistory = getModelForClass(PostHistoryClass);