import { Post, postSchema } from "../contract";
import { ImageDocument, PostHistoryDocument } from "../../database";

function mapPostSchema(
  p:
    | PostHistoryDocument
    | (Omit<PostHistoryDocument, "image"> & { image: ImageDocument | null }),
): Post {
  let post: Post;
  if (typeof p.image?._id === "object") {
    const { _id: id, status, image } = p;
    const idAsString = id.toString();
    const imageid = image._id.toString();
    post = {
      id: idAsString,
      timestamp: p.timestamp,
      imageid,
      status: {
        flag: status.flag,
        error: status.error ?? undefined,
        uri: status.uri ?? undefined,
      },
    };
  } else {
    const { _id: id, status } = p;
    const idAsString = id.toString();
    post = {
      id: idAsString,
      timestamp: p.timestamp,
      imageid: undefined,
      status: {
        flag: status.flag,
        error: status.error ?? undefined,
        uri: status.uri ?? undefined,
      },
    };
  }
  return postSchema.parse(post);
}

export { mapPostSchema };
