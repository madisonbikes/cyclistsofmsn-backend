import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop,
} from "@typegoose/typegoose";
import bcrypt from "bcryptjs";

/**
 * Holds users, typically admin but allows for others.
 */
@modelOptions({ schemaOptions: { collection: "users" } })
export class UserClass {
  private readonly BCRYPT_HASH_SIZE = 10;

  @prop({ required: true, unique: true, index: true })
  public username!: string;

  @prop({ required: true })
  public hashed_password!: string;

  @prop()
  public admin!: boolean;

  public async setPassword(this: DocumentType<UserClass>, password: string) {
    this.hashed_password = await bcrypt.hash(password, this.BCRYPT_HASH_SIZE);
  }

  public checkPassword(this: DocumentType<UserClass>, checkPassword: string) {
    return bcrypt.compare(checkPassword, this.hashed_password);
  }
}

export type UserDocument = DocumentType<UserClass>;
export const User = getModelForClass(UserClass);
