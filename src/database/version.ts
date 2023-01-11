import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop,
} from "@typegoose/typegoose";

/**
 * Holds a single row (when working correctly) that ID's the version of data in this database.
 * Used to allow for rescans of image metadata or other migration, when necessary.
 */
@modelOptions({ schemaOptions: { collection: "version" } })
export class VersionClass {
  @prop({ required: true, unique: true })
  public version!: number;
}

export type VersionDocument = DocumentType<VersionClass>;
export const Version = getModelForClass(VersionClass);
