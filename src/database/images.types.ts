import { Document, Model } from "mongoose";

/** use "I" notation only to differentiate from model instance */
interface IImage {
  filename: string,
  fs_timestamp?: Date,
  exif_createdon?: Date,
  deleted: boolean
}

export interface ImageDocument extends IImage, Document {}
export type ImageModel = Model<ImageDocument>