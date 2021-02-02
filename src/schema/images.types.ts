import { Document, Model } from "mongoose";

export interface IImage {
  filename: string
}

export interface IImageDocument extends IImage, Document {}
export interface IImageModel extends Model<IImageDocument> {}