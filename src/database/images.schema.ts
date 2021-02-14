import { Schema } from "mongoose";
import { ImageDocument, ImageModel } from "./images.types";

export const ImageSchema = new Schema<ImageDocument, ImageModel>({
  filename: { type: String, unique: true, required: true },
  fs_timestamp: { type: Date },
  exif_createdon: { type: Date },
  deleted: { type: Boolean, default: false, required: true }
});
