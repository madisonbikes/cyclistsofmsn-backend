import { Document, Model, ObjectId } from "mongoose";
import { Image } from "./images.types";

export enum PostStatus { PENDING = "pending", FAILED = "failed", COMPLETE = "complete" }

export interface PostHistory {
  image: ObjectId | Image,
  timestamp: Date,
  status: {
    flag: string,
    error: string | null,
    uri: string | null
  }
}

export interface PostHistoryDocument extends PostHistory, Document {
}

export interface PostHistoryModel extends Model<PostHistoryDocument> {
  findCurrentPost(): PostHistoryDocument | undefined;

  findOrderedPosts(): PostHistoryDocument[];
}