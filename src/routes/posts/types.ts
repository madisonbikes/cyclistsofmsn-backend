import { Post, postSchema, postStatusSchema } from "../contract";
import { PostHistoryDocument } from "../../database";
import { isDocument } from "@typegoose/typegoose";

import { z } from "zod";

/** map a post typegoose document to the appropriate return type for rest apis */
export const mapPostSchema = z.preprocess((p) => {
  const post = p as PostHistoryDocument;
  if (!isDocument(post)) {
    throw new Error(`unexpected post document: ${JSON.stringify(post)}`);
  }

  const status = postStatusSchema.parse(post.status);
  let retval: Post;
  if (isDocument(post.image)) {
    retval = {
      id: post.id,
      timestamp: post.timestamp,
      imageid: post.image._id ?? undefined,
      status,
    };
  } else {
    retval = {
      id: post.id,
      timestamp: post.timestamp,
      imageid: post.image?.toString() ?? undefined,
      status,
    };
  }
  return retval;
}, postSchema);
