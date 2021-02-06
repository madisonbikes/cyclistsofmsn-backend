import { model } from "mongoose";
import { PostHistoryDocument } from "./post_history.types";
import { PostHistorySchema } from "./post_history.schema";

export const PostHistory = model<PostHistoryDocument>("images", PostHistorySchema);
