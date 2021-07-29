import { DocumentType, getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

@modelOptions({schemaOptions: { collection: 'images'}})
export class ImageClass implements Base {
  id!: string;
  _id!: Types.ObjectId;
  
  @prop({required: true, unique: true})
  public filename!: string;

  @prop()
  public fs_timestamp?: Date;

  @prop()
  public exif_createdon?: Date;

  @prop({default: false, required: true })
  public deleted!: boolean;
}

export type ImageDocument = DocumentType<ImageClass>;
export const Image = getModelForClass(ImageClass)