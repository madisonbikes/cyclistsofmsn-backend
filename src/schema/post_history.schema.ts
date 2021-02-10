import { Schema } from "mongoose";

export const PostHistorySchema = new Schema({
  image: { type: Schema.Types.ObjectId, ref: "images", required: true },
  timestamp: { type: Schema.Types.Date, required: true, default: Date.now},
  destination: { type: Schema.Types.Mixed }
});
