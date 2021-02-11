import { Schema} from "mongoose";
import { ImageDocument, ImageModel } from "./images.types";

export const ImageSchema = new Schema<ImageDocument, ImageModel>({
  filename: { type: String, unique: true, required: true },
  timestamp: { type: Schema.Types.Date },
  exif: { type: Schema.Types.Mixed },
  deleted: { type: Schema.Types.Boolean, default: false }
});
