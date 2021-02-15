import { Document, Model, ObjectId } from "mongoose";
import { ImageDocument } from "./images.types";

export enum PostStatus { PENDING = "pending", FAILED = "failed", COMPLETE = "complete" }

/** use "I" notation only to differentiate from model instance */
interface IPostHistory {
  image: ObjectId | ImageDocument,
  timestamp: Date,
  status: {
    flag: string,
    error: string | null,
    uri: string | null
  }
}

export interface PostHistoryDocument extends IPostHistory, Document {
}

export interface PostHistoryModel extends Model<PostHistoryDocument> {
  findCurrentPost(): Promise<PostHistoryDocument | undefined>;

  findNextScheduledPost(): Promise<PostHistoryDocument | undefined>;

  findOrderedPosts(): Promise<PostHistoryDocument[]>;
}