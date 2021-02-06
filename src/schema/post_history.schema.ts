import { Schema } from "mongoose";

export const PostHistorySchema = new Schema({
  image_id: { type: Schema.Types.ObjectId, ref: "images", required: true },
  timestamp: { type: Schema.Types.Date, required: true, default: Date.now},
});