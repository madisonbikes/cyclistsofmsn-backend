import { model } from "mongoose";
import { ImageDocument } from "./images.types";
import { ImageSchema } from "./images.schema";

export const Image = model<ImageDocument>("images", ImageSchema);
