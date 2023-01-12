import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop,
} from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { collection: "images" } })
export class ImageClass {
  @prop({ required: true, unique: true })
  public filename!: string;

  @prop()
  public fs_timestamp?: Date;

  @prop()
  public exif_createdon?: Date;

  @prop()
  public description?: string;

  /**
   * if description is updated through admin UI, set this to false and it will not be updated
   * when scanning
   */
  @prop({ default: true, required: true })
  public description_from_exif!: boolean;

  /**
   * If a file is deleted from the filesystem, set this to true but don't remove record, to
   * preserve referential integrity for posts.
   */
  @prop({ default: false, required: true })
  public deleted!: boolean;
}

export type ImageDocument = DocumentType<ImageClass>;
export const Image = getModelForClass(ImageClass);
