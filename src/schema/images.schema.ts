import { Schema} from "mongoose";

export const ImageSchema = new Schema({
  filename: { type: String, unique: true }
});
