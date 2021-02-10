import { Document, Model, ObjectId } from "mongoose";
import { Image } from "./images.types";

export interface PostHistory {
  image: ObjectId | Image,
  timestamp: Date,
  destination: unknown
}

export interface PostHistoryDocument extends PostHistory, Document {}
export type PostHistoryModel = Model<PostHistoryDocument>