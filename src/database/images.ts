import { Schema, model, InferSchemaType } from "mongoose";

const imageSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true, required: true },
  filename: { type: String, required: true, unique: true, index: true },
  fs_timestamp: { type: Date },
  exif_createdon: { type: Date },
  width: { type: Number },
  height: { type: Number },
  description: { type: String },
  /**
   * this is unused now except for migration, but it used to be used to determine if the description
   * had been modified in the database but not in the image file.
   */
  description_from_exif: { type: Boolean, default: true, required: true },
  /**
   * If a file is deleted from the filesystem, set this to true but don't remove record, to
   * preserve referential integrity for posts.
   */
  deleted: { type: Boolean, default: false, required: true },
  /**
   * If a file is hidden, it will not be used for future posts.
   */
  hidden: { type: Boolean, default: false, required: true },
});

export type ImageDocument = InferSchemaType<typeof imageSchema>;

export const Image = model("images", imageSchema);
