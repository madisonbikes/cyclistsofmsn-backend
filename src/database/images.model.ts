import { model } from "mongoose";
import { ImageDocument, ImageModel } from "./images.types";
import { ImageSchema } from "./images.schema";

export const Image = model<ImageDocument, ImageModel>("images", ImageSchema);
