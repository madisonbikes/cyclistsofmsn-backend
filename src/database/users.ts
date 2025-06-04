import { Schema, model, InferSchemaType } from "mongoose";

/**
 * Holds users, typically admin but allows for others.
 */
const userSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true, required: true },
  username: { type: String, required: true, unique: true, index: true },
  hashed_password: { type: String, required: true },
  roles: { type: [String], required: true, default: [] },
});

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("users", userSchema);
