import { postSchema } from "../contract";
import { PostHistoryDocument } from "../../database";
import { isDocument } from "@typegoose/typegoose";

import { z } from "zod";

/** map a post typegoose document to the appropriate return type for rest apis */
export const mapPostSchema = z.preprocess((p) => {
  const post = p as PostHistoryDocument;
  if (!isDocument(post)) {
    throw new Error(`unexpected post document: ${JSON.stringify(post)}`);
  }

  if (isDocument(post.image)) {
    return {
      id: post.id,
      timestamp: post.timestamp,
      imageid: post.image._id,
      status: post.status,
    };
  } else {
    return {
      id: post.id,
      timestamp: post.timestamp,
      imageid: post.image,
      status: post.status,
    };
  }
}, postSchema);
