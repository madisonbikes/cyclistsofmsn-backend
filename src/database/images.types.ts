import { Document, Model } from "mongoose";

export interface Image {
  filename: string,
  fs_timestamp?: Date,
  exif_createdon?: Date,
  deleted: boolean
}

export interface ImageDocument extends Image, Document {}
export type ImageModel = Model<ImageDocument>