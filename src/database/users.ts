import {
  type DocumentType,
  getModelForClass,
  modelOptions,
  mongoose,
  prop,
} from "@typegoose/typegoose";

/**
 * Holds users, typically admin but allows for others.
 */
@modelOptions({ schemaOptions: { collection: "users" } })
class UserClass {
  @prop({ required: true, unique: true, index: true })
  public username!: string;

  @prop({ required: true })
  public hashed_password!: string;

  @prop({ type: String, required: true, default: [] })
  public roles!: mongoose.Types.Array<string>;
}

export type UserDocument = DocumentType<UserClass>;
export const User = getModelForClass(UserClass);
