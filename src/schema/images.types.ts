import { Document, Model } from "mongoose";
import { IccTags, Tags, XmpTags } from "exifreader";

export type ImageExifTags = Tags & IccTags & XmpTags;

export interface Image {
  filename: string,
  timestamp: Date | null,
  exif: ImageExifTags,
  deleted: boolean
}

export interface ImageDocument extends Image, Document {}
export type ImageModel = Model<ImageDocument>