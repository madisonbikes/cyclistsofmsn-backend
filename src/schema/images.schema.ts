import { Schema} from "mongoose";

export const ImageSchema = new Schema({
  filename: { type: String, unique: true, required: true },
  timestamp: { type: Schema.Types.Date },
  exif: { type: Schema.Types.Mixed },
  deleted: { type: Schema.Types.Boolean, default: false }
});
