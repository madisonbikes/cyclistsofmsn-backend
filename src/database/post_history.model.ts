import { model } from "mongoose";
import { PostHistoryDocument, PostHistoryModel } from "./post_history.types";
import { PostHistorySchema } from "./post_history.schema";

export const PostHistory: PostHistoryModel = model<PostHistoryDocument, PostHistoryModel>("posts", PostHistorySchema);